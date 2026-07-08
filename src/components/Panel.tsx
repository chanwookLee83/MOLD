import type { ReactNode } from 'react'

export function Panel({
  title,
  sub,
  action,
  children,
  className = '',
}: {
  title?: string
  sub?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-lg border border-line bg-card p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-ink-900">{title}</h3>}
            {sub && <p className="mt-0.5 text-xs text-ink-500">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
