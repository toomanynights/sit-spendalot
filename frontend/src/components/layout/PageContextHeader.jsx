import AccountSwitcher from '../AccountSwitcher'

export default function PageContextHeader({
  icon: Icon,
  title,
  subtitle,
  showAccountSwitcher = true,
}) {
  return (
    <div className="page-context-header">
      <div className="flex items-center gap-3 mb-1">
        {Icon ? <Icon size={28} className="text-gold shrink-0" /> : null}
        <h1 className="page-title mb-0">{title}</h1>
      </div>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      {showAccountSwitcher ? (
        <AccountSwitcher withBottomMargin={false} className="page-context-switcher" />
      ) : null}
    </div>
  )
}
