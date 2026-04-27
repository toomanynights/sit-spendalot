import { useEffect, useRef } from 'react'
import { accountsApi } from '../../api/accounts'
import { predictionsApi } from '../../api/predictions'
import { useSettings } from '../../hooks/useSettings'

const CHECK_INTERVAL_MS = 5 * 60 * 1000
const DEDUPE_PREFIX = 'spendalot:prediction-notification'

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

function dedupeKey(instanceId, day) {
  return `${DEDUPE_PREFIX}:${day}:${instanceId}`
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

export default function PredictionNotificationWatcher() {
  const { data: settings } = useSettings()
  const prevNotificationTimeRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const current = settings?.prediction_notifications_time || null
    const prev = prevNotificationTimeRef.current
    if (!current) return
    if (prev && prev !== current) {
      const prefix = `${DEDUPE_PREFIX}:`
      const toRemove = []
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i)
        if (key && key.startsWith(prefix)) {
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
    if (!settings?.prediction_notifications_enabled) return
    if (Notification.permission !== 'default') return

    Notification.requestPermission().catch(() => {})
  }, [settings?.prediction_notifications_enabled])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (!settings?.prediction_notifications_enabled) return

    const run = async () => {
      if (Notification.permission !== 'granted') return
      if (nowMinutes() < toMinutes(settings.prediction_notifications_time)) return

      let pending = []
      try {
        pending = await predictionsApi.listInstances({ status: 'pending' })
      } catch {
        return
      }
      let accounts = []
      try {
        accounts = await accountsApi.list()
      } catch {
        accounts = []
      }

      const today = todayStr()
      const dueOrOverdue = (pending || []).filter(
        (instance) => instance.scheduled_date <= today
      )
      const accountNameById = new Map(
        (accounts || []).map((account) => [account.id, account.name])
      )

      const byAccount = new Map()
      for (const instance of dueOrOverdue) {
        const key = dedupeKey(instance.id, today)
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
          window.localStorage.setItem(dedupeKey(instance.id, today), '1')
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
    settings?.prediction_notifications_time,
  ])

  return null
}
