import { BarChart3 } from 'lucide-react'
import PageContextHeader from '../components/layout/PageContextHeader'
import { useSelectedAccount } from '../contexts/AccountContext'

export default function AnalyticsPage() {
  const { selectedAccount } = useSelectedAccount()
  return (
    <div className="page-shell">
      <PageContextHeader
        icon={BarChart3}
        title="Analytics"
        subtitle={
          selectedAccount
            ? `Charts and trends for ${selectedAccount.name} — Phase 6.5 shall illuminate.`
            : 'Charts and trends of thy treasury — Phase 6.5 shall illuminate.'
        }
        showAccountSwitcher
      />
      <div className="page-container" />
    </div>
  )
}
