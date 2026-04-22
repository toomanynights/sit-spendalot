import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Calendar, ChevronLeft, ChevronRight, TrendingUp, Trophy } from 'lucide-react'
import PageContextHeader from '../components/layout/PageContextHeader'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { useSelectedAccount } from '../contexts/AccountContext'
import { useSettings } from '../hooks/useSettings'
import {
  useAnalyticsInsights,
  useDailyTrend,
  useMonthlyComparison,
  useSpendingByCategory,
  useSpendingBySubcategory,
  useSpendingByType,
} from '../hooks/useStats'
import { formatAmount, formatDate } from '../utils/format'

function toLocalDateInput(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function monthRange(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const today = new Date()
  const isCurrentMonth = now.getFullYear() === today.getFullYear() && now.getMonth() === today.getMonth()
  const end = isCurrentMonth
    ? today
    : new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { from: toLocalDateInput(start), to: toLocalDateInput(end) }
}

function shiftMonth(anchor, delta) {
  return new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1)
}

function lastNDaysRange(days) {
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - Math.max(1, days) + 1)
  return { from: toLocalDateInput(start), to: toLocalDateInput(end) }
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-gold mt-0.5 shrink-0" />
      <div>
        <h2 className="text-gold text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="text-sm text-gold-muted mt-1">{subtitle}</p> : null}
      </div>
    </div>
  )
}

const MONTH_PAGE_SIZE = 5

function MiniBars({ rows, valueKey = 'total', labelKey = 'label' }) {
  const maxVal = useMemo(
    () => rows.reduce((m, r) => Math.max(m, Number(r[valueKey] || 0)), 0),
    [rows, valueKey]
  )
  if (!rows?.length) return null
  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const val = Number(row[valueKey] || 0)
        const pct = maxVal > 0 ? Math.max(4, Math.round((val / maxVal) * 100)) : 0
        const tone = row.tone || 'normal'
        const barClass =
          tone === 'high'
            ? 'bg-danger/80'
            : tone === 'low'
              ? 'bg-success/80'
              : 'bg-gold/60'
        return (
          <div key={row[labelKey]} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-parchment">{row[labelKey]}</span>
              <span className="text-gold-muted">{formatAmount(val)}</span>
            </div>
            <div className="h-2 rounded bg-black/30 overflow-hidden">
              <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle)
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle)
  const startInner = polarToCartesian(cx, cy, rInner, endAngle)
  const endInner = polarToCartesian(cx, cy, rInner, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y}`,
    'Z',
  ].join(' ')
}

function DonutChart({ rows }) {
  const [expandedIdx, setExpandedIdx] = useState(null)
  const total = rows.reduce((s, r) => s + Number(r.total || 0), 0)
  if (total <= 0) return null
  const colors = ['#d4af37', '#8b4513', '#cd5c5c', '#4ade80', '#7c5cff', '#f59e0b']
  let cursor = 0
  const parts = rows.map((r, idx) => {
    const share = Number(r.total || 0) / total
    const start = cursor
    const end = cursor + share * 360
    cursor = end
    return { ...r, color: colors[idx % colors.length], start, end }
  })
  const cx = 90
  const cy = 90
  const rOuter = 80
  const rInner = 48
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-4 items-center">
      <div className="w-[180px] mx-auto">
        <svg viewBox="0 0 180 180" className="w-[180px] h-[180px] mx-auto">
          {parts.map((p, idx) => (
            <path
              key={p.label}
              d={arcPath(cx, cy, rOuter, rInner, p.start, p.end)}
              fill={p.color}
              opacity={expandedIdx == null || expandedIdx === idx ? 1 : 0.45}
              className="cursor-pointer transition-opacity"
              onClick={() => setExpandedIdx((prev) => (prev === idx ? null : idx))}
            />
          ))}
          <circle cx={cx} cy={cy} r={rInner - 1} fill="rgba(26,15,10,0.92)" stroke="rgba(212,175,55,0.25)" />
          <text x={cx} y={cy} textAnchor="middle" className="fill-[#d4af37]" style={{ fontSize: 12 }}>
            {formatAmount(total)}
          </text>
        </svg>
      </div>
      <div className="space-y-2">
        {parts.map((p, idx) => (
          <div
            key={p.label}
            className="rounded-md border border-gold/10 bg-black/20"
          >
            <button
              type="button"
              className="w-full px-3 py-2 flex items-center justify-between text-sm"
              onClick={() => setExpandedIdx((prev) => (prev === idx ? null : idx))}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
                <span className="text-parchment">{p.label}</span>
              </div>
              <span className="text-gold-muted">
                {formatAmount(p.total)} ({((Number(p.total || 0) / total) * 100).toFixed(0)}%)
              </span>
            </button>
            {expandedIdx === idx && (p.categories || []).length > 0 ? (
              <div className="px-3 pb-2 pt-1 border-t border-gold/10 space-y-1 max-h-40 overflow-auto">
                {p.categories.map((cat) => (
                  <div key={cat.category_name} className="flex items-center justify-between text-xs">
                    <span className="text-parchment truncate pr-2">{cat.category_name}</span>
                    <span className="text-gold-muted shrink-0">{formatAmount(cat.total)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { selectedAccount, selectedId } = useSelectedAccount()
  const { data: settings } = useSettings()
  const rollingDays = settings?.rolling_average_days ?? 30

  const [typeWindow, setTypeWindow] = useState(30)
  const [categoryType, setCategoryType] = useState('daily')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [monthAnchor, setMonthAnchor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [monthPage, setMonthPage] = useState(0)

  const typeRange = useMemo(() => lastNDaysRange(typeWindow), [typeWindow])
  const currentMonth = useMemo(() => monthRange(monthAnchor), [monthAnchor])
  const isCurrentMonth = monthAnchor.getFullYear() === new Date().getFullYear()
    && monthAnchor.getMonth() === new Date().getMonth()

  const typeQuery = useSpendingByType({
    date_from: typeRange.from,
    date_to: typeRange.to,
    ...(selectedId ? { account_id: selectedId } : {}),
  })
  const categoryQuery = useSpendingByCategory({
    date_from: currentMonth.from,
    date_to: currentMonth.to,
    tx_type: categoryType,
    ...(selectedId ? { account_id: selectedId } : {}),
  })
  const dailyTrendQuery = useDailyTrend(rollingDays, selectedId)
  const monthlyQuery = useMonthlyComparison(6, selectedId)
  const insightsQuery = useAnalyticsInsights({
    date_from: typeRange.from,
    date_to: typeRange.to,
    ...(selectedId ? { account_id: selectedId } : {}),
  })

  const categoryRows = categoryQuery.data?.categories || []
  useEffect(() => {
    if (!categoryRows.length) {
      setSelectedCategory('')
      return
    }
    if (!selectedCategory || !categoryRows.some((r) => r.category_name === selectedCategory)) {
      setSelectedCategory(categoryRows[0].category_name)
    }
  }, [categoryRows, selectedCategory])

  const subcategoryQuery = useSpendingBySubcategory({
    category_name: selectedCategory,
    date_from: currentMonth.from,
    date_to: currentMonth.to,
    tx_type: categoryType,
    ...(selectedId ? { account_id: selectedId } : {}),
  })

  const typeRows = typeQuery.data?.types || []
  const trendRows = dailyTrendQuery.data?.points || []
  const monthRows = monthlyQuery.data?.months || []
  const insights = insightsQuery.data
  const baselineAmount = trendRows.length > 0 ? Number(trendRows[0].rolling_average || 0) : 0
  const hasInsights = insights && (
    insights.days_above_zero > 0 ||
    insights.longest_streak_without_unplanned > 0 ||
    insights.most_expensive_purchase_amount ||
    insights.biggest_spending_day_amount ||
    insights.most_frequent_payment_method ||
    insights.most_frequent_daily_category ||
    insights.most_frequent_unplanned_category ||
    (insights.category_trends?.length || 0) > 0
  )

  const typeCards = typeRows.map((row) => ({
    label: row.tx_type === 'predicted' ? 'Scheduled' : row.tx_type[0].toUpperCase() + row.tx_type.slice(1),
    total: Number(row.total || 0),
    categories: row.categories || [],
  }))
  const trendCards = trendRows
    .filter((p) => Number(p.spending || 0) > 0)
    .map((p) => ({
      label: formatDate(p.date),
      total: Number(p.spending || 0),
      tone: p.status,
    }))
  const monthSpendingRows = monthRows
    .filter((m) => Number(m.spending || 0) > 0 || Number(m.gains || 0) > 0)
    .map((m) => ({
      month: m.month,
      spending: Number(m.spending || 0),
      gains: Number(m.gains || 0),
    }))

  const monthRowsWithTrend = monthSpendingRows.map((m, idx) => {
    const prev = idx > 0 ? monthSpendingRows[idx - 1] : null
    return {
      ...m,
      spendingDelta: prev ? m.spending - prev.spending : null,
      gainsDelta: prev ? m.gains - prev.gains : null,
    }
  })
  const monthRowsDisplay = [...monthRowsWithTrend].reverse()
  const monthTotalPages = Math.max(1, Math.ceil(monthRowsDisplay.length / MONTH_PAGE_SIZE))
  const monthPageSafe = Math.min(monthPage, monthTotalPages - 1)
  const monthSlice = monthRowsDisplay.slice(
    monthPageSafe * MONTH_PAGE_SIZE,
    monthPageSafe * MONTH_PAGE_SIZE + MONTH_PAGE_SIZE
  )
  const monthHasPrev = monthPageSafe > 0
  const monthHasNext = monthPageSafe < monthTotalPages - 1

  useEffect(() => {
    setMonthPage((p) => Math.min(p, monthTotalPages - 1))
  }, [monthTotalPages])

  return (
    <div className="page-shell">
      <PageContextHeader
        icon={BarChart3}
        title="Analytics"
        subtitle={
          selectedAccount
            ? `Charts and trends for ${selectedAccount.name}`
            : 'Charts and trends of thy treasury'
        }
        showAccountSwitcher
      />
      <div className="page-container">
        <div className="flex flex-col gap-6 max-w-3xl w-full">
          <SectionHeading
            icon={Calendar}
            title="Composition"
            subtitle="Spending by type and by category for the selected account."
          />

          <Card shimmer>
            <CardHeader title="Spending by type">
              <div className="ml-auto segmented-toggle" role="group" aria-label="Spending by type range">
                {[30, 60, 90].map((d) => (
                  <button
                    type="button"
                    key={d}
                    className={[
                      'segmented-toggle-button text-xs py-2 px-3',
                      typeWindow === d ? 'segmented-toggle-button-active' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => setTypeWindow(d)}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              {typeQuery.isLoading ? (
                <p className="text-gold-muted font-crimson">Gathering ledgers...</p>
              ) : typeCards.length > 0 ? (
                <DonutChart rows={typeCards} />
              ) : (
                <p className="text-gold-muted/60 font-crimson italic text-sm">No spending records in this period.</p>
              )}
            </CardBody>
          </Card>

          <Card shimmer>
              <CardHeader title="Spending by category">
                <div className="ml-auto segmented-toggle" role="group" aria-label="Category type">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'unplanned', label: 'Unplanned' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={[
                        'segmented-toggle-button text-xs py-2 px-3',
                        categoryType === opt.value ? 'segmented-toggle-button-active' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setCategoryType(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardBody className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <p className="card-subtitle lg:col-span-2">
                  Selected period: {currentMonth.from} to {currentMonth.to}
                </p>
                {categoryRows.length > 0 ? (
                  <MiniBars
                    rows={categoryRows.map((row) => ({
                      label: row.category_name,
                      total: Number(row.total || 0),
                    }))}
                  />
                ) : (
                  <p className="text-gold-muted/60 font-crimson italic text-sm">
                    No category spending found for this month. Try Previous.
                  </p>
                )}
                <div className="space-y-3">
                  {categoryRows.length > 0 ? (
                    <>
                      <label className="block">
                        <span className="input-label">Inspect subcategories</span>
                        <select
                          className="input"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          {categoryRows.map((row) => (
                            <option key={row.category_name} value={row.category_name}>
                              {row.category_name}
                            </option>
                          ))}
                        </select>
                      </label>
                      {subcategoryQuery.isLoading ? (
                        <p className="text-gold-muted font-crimson text-sm">Loading subcategories...</p>
                      ) : (subcategoryQuery.data?.subcategories || []).length > 0 ? (
                        <MiniBars
                          rows={subcategoryQuery.data.subcategories.map((row) => ({
                            label: row.subcategory,
                            total: Number(row.total || 0),
                          }))}
                        />
                      ) : (
                        <p className="text-gold-muted/60 font-crimson italic text-sm">No subcategory data for this category.</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gold-muted/60 font-crimson italic text-sm">
                      Subcategory details appear once category data exists.
                    </p>
                  )}
                </div>
                <div className="lg:col-span-2 flex items-center justify-between mt-3 pt-3 border-t border-gold/10">
                  <button
                    type="button"
                    onClick={() => setMonthAnchor((d) => shiftMonth(d, -1))}
                    className="flex items-center gap-1 btn btn-ghost text-sm"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthAnchor((d) => shiftMonth(d, 1))}
                    disabled={isCurrentMonth}
                    className="flex items-center gap-1 btn btn-ghost text-sm disabled:opacity-30"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </CardBody>
            </Card>

          <SectionHeading
            icon={TrendingUp}
            title="Baseline and trends"
            subtitle={`Daily baseline uses rolling average (${rollingDays} days) and realm thresholds.`}
          />

          <Card shimmer>
              <CardHeader title="Daily spending vs average" />
              <CardBody>
                <div className="mb-3 text-xs">
                  <p className="text-gold-muted">
                    Baseline: <span className="text-gold">{formatAmount(baselineAmount)} / day</span>
                  </p>
                </div>
                <div className="mb-3 flex items-center gap-4 text-xs">
                  <span className="text-gold-muted flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-danger/80" />
                    Above {(settings?.daily_high_threshold ?? 110)}%
                  </span>
                  <span className="text-gold-muted flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-success/80" />
                    Below {(settings?.daily_low_threshold ?? 90)}%
                  </span>
                  <span className="text-gold-muted flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gold/60" />
                    Within range
                  </span>
                </div>
                {trendCards.length > 0 ? (
                  <MiniBars rows={trendCards} />
                ) : (
                  <p className="text-gold-muted/60 font-crimson italic text-sm">
                    No daily spending data in this window.
                  </p>
                )}
              </CardBody>
            </Card>

          <Card shimmer>
              <CardHeader title="Monthly comparison (spending and gains)" />
              <CardBody>
                {monthRowsDisplay.length > 0 ? (
                  <div className="space-y-3">
                    {monthSlice.map((m) => (
                      <div key={m.month} className="rounded-md bg-black/20 p-3">
                        <p className="text-xs text-gold-muted mb-2">{m.month}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <p className="text-danger flex items-center gap-2">
                            <span>Spending: {formatAmount(m.spending)}</span>
                            {m.spendingDelta != null ? (
                              <span className={m.spendingDelta > 0 ? 'text-danger' : m.spendingDelta < 0 ? 'text-success' : 'text-gold-muted'}>
                                {m.spendingDelta > 0 ? '↗' : m.spendingDelta < 0 ? '↘' : '→'}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-success flex items-center gap-2">
                            <span>Gains: {formatAmount(m.gains)}</span>
                            {m.gainsDelta != null ? (
                              <span className={m.gainsDelta > 0 ? 'text-success' : m.gainsDelta < 0 ? 'text-danger' : 'text-gold-muted'}>
                                {m.gainsDelta > 0 ? '↗' : m.gainsDelta < 0 ? '↘' : '→'}
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gold-muted/60 font-crimson italic text-sm">
                    No monthly data yet for this account.
                  </p>
                )}
                {(monthHasPrev || monthHasNext) ? (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/10">
                    <button
                      type="button"
                      onClick={() => setMonthPage((p) => p - 1)}
                      disabled={!monthHasPrev}
                      className="flex items-center gap-1 btn btn-ghost text-sm disabled:opacity-30"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonthPage((p) => p + 1)}
                      disabled={!monthHasNext}
                      className="flex items-center gap-1 btn btn-ghost text-sm disabled:opacity-30"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                ) : null}
              </CardBody>
            </Card>

          {insightsQuery.isError && (
            <Card danger shimmer>
              <CardHeader title="Insights" />
              <CardBody>
                <p className="text-danger font-crimson italic text-sm">
                  Hark! Insights could not be calculated for this period.
                </p>
              </CardBody>
            </Card>
          )}

          <SectionHeading
            icon={Trophy}
            title="Insights"
            subtitle={`Text achievements and highlights (${typeWindow}-day window).`}
          />
          <Card shimmer>
            <CardHeader title="Achievements and highlights" />
            <CardBody className="space-y-3">
              {!hasInsights ? (
                <p className="text-gold-muted/60 font-crimson italic text-sm">
                  No highlight metrics yet for this period.
                </p>
              ) : (
                <>
                  <p className="text-sm text-parchment">
                    <span className="text-gold">Days above 0 balance:</span> {insights.days_above_zero}
                  </p>
                  <p className="text-sm text-parchment">
                    <span className="text-gold">Longest streak without unplanned spending:</span>{' '}
                    {insights.longest_streak_without_unplanned} days
                  </p>
                  {insights.days_since_last_overdue_prediction != null ? (
                    <p className="text-sm text-parchment">
                      <span className="text-gold">Days since last overdue prediction:</span>{' '}
                      {insights.days_since_last_overdue_prediction}
                    </p>
                  ) : null}
                  {insights.most_expensive_purchase_amount ? (
                    <p className="text-sm text-parchment">
                      <span className="text-gold">Most expensive unplanned purchase:</span>{' '}
                      {formatAmount(insights.most_expensive_purchase_amount)} ({insights.most_expensive_purchase_label || '—'})
                    </p>
                  ) : null}
                  {insights.biggest_spending_day_amount ? (
                    <p className="text-sm text-parchment">
                      <span className="text-gold">Biggest spending day:</span>{' '}
                      {formatAmount(insights.biggest_spending_day_amount)} on {formatDate(insights.biggest_spending_day_date)}
                    </p>
                  ) : null}
                  {insights.most_frequent_payment_method ? (
                    <p className="text-sm text-parchment">
                      <span className="text-gold">Most frequent payment method:</span>{' '}
                      {insights.most_frequent_payment_method} ({insights.most_frequent_payment_method_count} times)
                    </p>
                  ) : null}
                  {insights.most_frequent_daily_category ? (
                    <p className="text-sm text-parchment">
                      <span className="text-gold">Most frequent daily category:</span>{' '}
                      {insights.most_frequent_daily_category} ({insights.most_frequent_daily_category_count} times)
                    </p>
                  ) : null}
                  {insights.most_frequent_unplanned_category ? (
                    <p className="text-sm text-parchment">
                      <span className="text-gold">Most frequent unplanned category:</span>{' '}
                      {insights.most_frequent_unplanned_category} ({insights.most_frequent_unplanned_category_count} times)
                    </p>
                  ) : null}

                  {(insights.category_trends || []).length > 0 && (
                    <div className="pt-2 border-t border-gold/10">
                      <p className="text-xs text-gold-muted mb-2 uppercase tracking-wide">Category trends</p>
                      <div className="space-y-1">
                        {insights.category_trends.map((t) => (
                          <p key={t.category_name} className="text-sm text-parchment">
                            <span className="text-gold">{t.category_name}:</span>{' '}
                            {Number(t.delta_percent) >= 0 ? '↗' : '↘'} {Math.abs(Number(t.delta_percent)).toFixed(1)}%
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
