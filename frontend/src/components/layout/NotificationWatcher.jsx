import { useEffect, useRef } from 'react'
import { accountsApi } from '../../api/accounts'
import { predictionsApi } from '../../api/predictions'
import { useSettings } from '../../hooks/useSettings'

const CHECK_INTERVAL_MS = 5 * 60 * 1000
const PREDICTION_PREFIX = 'spendalot:prediction-notification'
const CHECKUP_PREFIX = 'spendalot:checkup-notification'

function todayStr() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm || '09:00').split(':').map((x) => Number.parseInt(x, 10))
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 9 * 60
  return (h * 60) + m
}

function nowMinutes() {
  const now = new Date()
  return (now.getHours() * 60) + now.getMinutes()
}

function dedupeKey(prefix, id, day) {
  return `${prefix}:${day}:${id}`
}

function summarizeAccount(instances, today) {
  const dueToday = instances.filter((instance) => instance.scheduled_date === today)
  const overdue = instances.filter((instance) => instance.scheduled_date < today)

  if (overdue.length > 0 && dueToday.length > 0) {
    return `${dueToday.length} due today, ${overdue.length} overdue`
  }
  if (overdue.length > 0) {
    return `${overdue.length} overdue prophec${overdue.length === 1 ? 'y' : 'ies'}`
  }

  if (dueToday.length <= 2) {
    const names = dueToday.map((instance) => instance.template_name).join(', ')
    if (names.length <= 48) {
      return `${names} pending today`
    }
  }
  return `${dueToday.length} prophec${dueToday.length === 1 ? 'y' : 'ies'} pending today`
}

function diffDays(fromDateStr) {
  const last = new Date(fromDateStr)
  if (Number.isNaN(last.getTime())) return null
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfLast = new Date(last.getFullYear(), last.getMonth(), last.getDate())
  return Math.max(0, Math.round((startOfToday - startOfLast) / 86_400_000))
}

/**
 * Foreground notification watcher for both pending predictions and overdue
 * account checkups. Both share the user's daily notification time
 * (`settings.prediction_notifications_time`) for a single setup point.
 */
export default function NotificationWatcher() {
  const { data: settings } = useSettings()
  const prevNotificationTimeRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const current = settings?.prediction_notifications_time || null
    const prev = prevNotificationTimeRef.current
    if (!current) return
    if (prev && prev !== current) {
      const toRemove = []
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i)
        if (
          key &&
          (key.startsWith(`${PREDICTION_PREFIX}:`) || key.startsWith(`${CHECKUP_PREFIX}:`))
        ) {
          toRemove.push(key)
        }
      }
      for (const key of toRemove) {
        window.localStorage.removeItem(key)
      }
    }
    prevNotificationTimeRef.current = current
  }, [settings?.prediction_notifications_time])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    const anyEnabled =
      settings?.prediction_notifications_enabled ||
      settings?.checkup_notifications_enabled
    if (!anyEnabled) return
    if (Notification.permission !== 'default') return

    Notification.requestPermission().catch(() => {})
  }, [
    settings?.prediction_notifications_enabled,
    settings?.checkup_notifications_enabled,
  ])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    const predictionsOn = Boolean(settings?.prediction_notifications_enabled)
    const checkupsOn = Boolean(settings?.checkup_notifications_enabled)
    if (!predictionsOn && !checkupsOn) return

    const run = async () => {
      if (Notification.permission !== 'granted') return
      if (nowMinutes() < toMinutes(settings.prediction_notifications_time)) return

      const today = todayStr()

      let accounts = []
      try {
        accounts = await accountsApi.list()
      } catch {
        accounts = []
      }
      const accountNameById = new Map(
        (accounts || []).map((account) => [account.id, account.name])
      )

      // --- Predictions: due today / overdue, grouped by account ---------
      if (predictionsOn) {
        let pending = []
        try {
          pending = await predictionsApi.listInstances({ status: 'pending' })
        } catch {
          pending = []
        }
        const dueOrOverdue = (pending || []).filter(
          (instance) => instance.scheduled_date <= today
        )
        const byAccount = new Map()
        for (const instance of dueOrOverdue) {
          const key = dedupeKey(PREDICTION_PREFIX, instance.id, today)
          if (window.localStorage.getItem(key)) continue
          const bucket = byAccount.get(instance.account_id) || []
          bucket.push(instance)
          byAccount.set(instance.account_id, bucket)
        }
        for (const [accountId, instances] of byAccount.entries()) {
          if (!instances.length) continue
          const accountName = accountNameById.get(accountId) || `Account ${accountId}`
          const body = summarizeAccount(instances, today)
          new Notification(`@${accountName}`, { body })
          for (const instance of instances) {
            window.localStorage.setItem(
              dedupeKey(PREDICTION_PREFIX, instance.id, today),
              '1'
            )
          }
        }
      }

      // --- Checkups: overdue per account ---------------------------------
      if (checkupsOn) {
        const threshold = Number(settings?.checkup_notification_days ?? 30)
        for (const account of accounts || []) {
          const dKey = dedupeKey(CHECKUP_PREFIX, account.id, today)
          if (window.localStorage.getItem(dKey)) continue
          let lastDate = null
          try {
            const rows = await accountsApi.listCheckups(account.id)
            lastDate = rows?.[0]?.checkup_date ?? null
          } catch {
            continue
          }
          let body = null
          if (lastDate == null) {
            body = 'Hath never been reconciled - a checkup is due.'
          } else {
            const days = diffDays(lastDate)
            if (days != null && days > threshold) {
              body = `${days} days since last reconciliation. A checkup is due.`
            }
          }
          if (!body) continue
          new Notification(`@${account.name}`, { body })
          window.localStorage.setItem(dKey, '1')
        }
      }
    }

    run()
    const timerId = window.setInterval(run, CHECK_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        run()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timerId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [
    settings?.prediction_notifications_enabled,
    settings?.checkup_notifications_enabled,
    settings?.prediction_notifications_time,
    settings?.checkup_notification_days,
  ])

  return null
}
