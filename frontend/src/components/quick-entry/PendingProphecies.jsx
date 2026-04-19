import { useState } from 'react'
import { Scroll, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { usePredictionInstances, useSkipInstance } from '../../hooks/usePredictions'
import { useSelectedAccount } from '../../contexts/AccountContext'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatAmount, formatRelativeDate } from '../../utils/format'

const PAGE_SIZE = 5

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-md bg-black/20 animate-pulse min-h-touch">
      <div className="flex-1 space-y-1.5 pr-4">
        <div className="h-2.5 bg-gold/10 rounded w-2/5" />
        <div className="h-2 bg-gold/10 rounded w-1/3" />
      </div>
      <div className="h-3 bg-gold/10 rounded w-16" />
    </div>
  )
}

export default function PendingProphecies({ linkedInstanceIds, onAddInstance }) {
  const { selectedId } = useSelectedAccount()
  const [expanded, setExpanded] = useState(false)
  const [page, setPage] = useState(0)
  const skip = useSkipInstance()

  const { data: instances, isLoading, error } = usePredictionInstances(
    selectedId
      ? { account_id: selectedId, status: 'pending', next_per_template: true }
      : null
  )

  const all = instances ?? []
  const today = todayStr()
  const overdueCount = all.filter((i) => i.scheduled_date < today).length

  const paginated = all.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const hasPrev = page > 0
  const hasNext = (page + 1) * PAGE_SIZE < all.length

  function borderClass(scheduledDate) {
    if (scheduledDate < today) return 'border-l-danger/70'
    if (scheduledDate === today) return 'border-l-gold/60'
    return 'border-l-gold/25'
  }

  return (
    <Card shimmer>
      <CardHeader icon={<Scroll size={20} />}>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex flex-1 min-w-0 items-center justify-between gap-2 text-left min-h-touch py-1 rounded-md hover:bg-black/10"
        >
          <span className="text-gold text-xl font-semibold tracking-wide font-cinzel m-0">
            Prophecies Awaiting
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-gold-muted font-crimson">
              ({all.length}
              {overdueCount > 0 ? (
                <span className="text-danger"> · {overdueCount} overdue</span>
              ) : null}
              )
            </span>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </button>
      </CardHeader>

      {expanded && (
        <div className="px-6 pt-6 pb-4 border-t border-gold/10">
          {error && (
            <p className="text-danger font-crimson italic text-sm">
              Hark! The prophecies could not be retrieved.
            </p>
          )}

          {isLoading && (
            <div className="space-y-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          )}

          {!isLoading && !error && all.length === 0 && (
            <p className="text-gold-muted/60 font-crimson italic text-sm text-center py-4">
              Thy ledger is clear — no prophecies await.
            </p>
          )}

          {!isLoading && !error && paginated.length > 0 && (
            <div className="space-y-2">
              {paginated.map((instance) => {
                const isOverdue = instance.scheduled_date < today
                const added = linkedInstanceIds.has(instance.id)
                return (
                  <div
                    key={instance.id}
                    className={[
                      'rounded-md bg-black/20 border-l-4 pl-2 pr-2 py-2 flex flex-wrap items-start gap-2',
                      borderClass(instance.scheduled_date),
                      added ? 'opacity-40' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">
                        {instance.template_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gold-muted">
                          {formatRelativeDate(instance.scheduled_date + 'T12:00:00')}
                          {' · '}
                          {formatAmount(instance.amount)}
                        </span>
                        {isOverdue && <Badge variant="danger">Overdue</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={added || skip.isPending}
                        onClick={() => skip.mutate(instance.id)}
                        className="btn btn-ghost text-xs px-2 py-2 min-h-touch disabled:opacity-40"
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        disabled={added}
                        onClick={() => onAddInstance(instance)}
                        className="flex items-center gap-1 text-xs px-3 py-2 min-h-touch rounded font-bold bg-gold/20 text-gold hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {added ? (
                          <>
                            <Plus size={14} className="opacity-50" /> Added ✓
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {expanded && !isLoading && !error && all.length > PAGE_SIZE && (hasPrev || hasNext) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/10">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPrev}
                className="flex items-center gap-1 btn btn-ghost text-sm min-h-touch disabled:opacity-30"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="flex items-center gap-1 btn btn-ghost text-sm min-h-touch disabled:opacity-30"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
