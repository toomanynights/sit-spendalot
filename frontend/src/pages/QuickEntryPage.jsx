import { useMemo, useRef, useState } from 'react'
import { Zap } from 'lucide-react'
import PendingProphecies from '../components/quick-entry/PendingProphecies'
import QuickEntryForm from '../components/quick-entry/QuickEntryForm'
import { createEmptyRow, createPredictionRow } from '../components/quick-entry/rowUtils'
import PageContextHeader from '../components/layout/PageContextHeader'
import { useSelectedAccount } from '../contexts/AccountContext'
import '../styles/quick-entry.css'

export default function QuickEntryPage() {
  const { selectedAccount } = useSelectedAccount()
  const [rows, setRows] = useState(() => [createEmptyRow()])
  const scrollAnchorRef = useRef(null)

  const linkedInstanceIds = useMemo(() => {
    const s = new Set()
    for (const r of rows) {
      if (r.kind === 'prediction' && r.predictionInstanceId) {
        s.add(r.predictionInstanceId)
      }
    }
    return s
  }, [rows])

  function handleAddInstance(instance) {
    const newRow = createPredictionRow(instance)
    setRows((prev) => [...prev, newRow])
    setTimeout(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      document.getElementById(`qe-amount-${newRow.id}`)?.focus()
    }, 80)
  }

  return (
    <div className="page-shell">
      <PageContextHeader
        icon={Zap}
        title="Quick Entry"
        subtitle={
          selectedAccount
            ? `Record many deeds for ${selectedAccount.name}`
            : 'Loading thy treasury…'
        }
        showAccountSwitcher
      />

      <div className="page-container">
        <div className="flex flex-col gap-8 max-w-3xl w-full">
          <PendingProphecies
            linkedInstanceIds={linkedInstanceIds}
            onAddInstance={handleAddInstance}
          />
          <QuickEntryForm rows={rows} setRows={setRows} scrollAnchorRef={scrollAnchorRef} />
        </div>
      </div>
    </div>
  )
}
