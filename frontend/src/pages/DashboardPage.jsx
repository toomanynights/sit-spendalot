import { LayoutDashboard } from 'lucide-react'
import TodayFortune from '../components/dashboard/TodayFortune'
import LowestFortune from '../components/dashboard/LowestFortune'
import RecordDeed from '../components/dashboard/RecordDeed'
import RecentChronicles from '../components/dashboard/RecentChronicles'
import FutureProphecies from '../components/dashboard/FutureProphecies'
import FloatingAdvisor from '../components/FloatingAdvisor'
import PageContextHeader from '../components/layout/PageContextHeader'
import { useSelectedAccount } from '../contexts/AccountContext'

export default function DashboardPage() {
  const { selectedAccount } = useSelectedAccount()
  const isPrimary = selectedAccount?.is_primary

  return (
    <div className="page-shell">
      <PageContextHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle={
          selectedAccount
            ? `Viewing treasury: ${selectedAccount.name}`
            : 'Loading thy treasury…'
        }
        showAccountSwitcher
      />
      <div className="page-container">
        <div className="grid-dashboard">
          {/* Column 1: Today's Status & History */}
          <div className="flex flex-col gap-8">
            <TodayFortune />
            <RecentChronicles />
          </div>

          {isPrimary ? (
            <>
              {/* Column 2: Risk Forecast + Upcoming Predictions (Primary only) */}
              <div className="flex flex-col gap-8">
                <LowestFortune />
                <FutureProphecies />
              </div>

              {/* Column 3: Data Entry */}
              <div className="flex flex-col gap-8">
                <RecordDeed />
              </div>
            </>
          ) : (
            /* Non-primary: Data Entry + Upcoming Predictions */
            <div className="flex flex-col gap-8">
              <RecordDeed />
              <FutureProphecies />
            </div>
          )}
        </div>

        <FloatingAdvisor />
      </div>
    </div>
  )
}
