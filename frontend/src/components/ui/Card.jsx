/**
 * Card family — thin wrappers around the .card / .card-header / .card-body
 * CSS classes defined in index.css.
 *
 * Usage:
 *   <Card shimmer>
 *     <CardHeader icon={<Coins />} title="Thy Treasury" />
 *     <CardBody>…content…</CardBody>
 *   </Card>
 */

export function Card({ children, danger = false, shimmer = false, className = '' }) {
  const base = danger ? 'card-danger' : 'card'
  const shimmerClass = shimmer ? 'shimmer-top' : ''
  return (
    <div className={[base, shimmerClass, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function CardHeader({ icon, title, children, className = '' }) {
  return (
    <div className={['card-header', className].filter(Boolean).join(' ')}>
      {icon && <span className="text-gold shrink-0">{icon}</span>}
      {title && <h2 className="card-title">{title}</h2>}
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={['card-body', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
