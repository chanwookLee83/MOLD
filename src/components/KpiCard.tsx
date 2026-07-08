interface KpiCardProps {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'good' | 'warn' | 'bad'
}

const toneStyles: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-navy-800',
  good: 'text-good-600',
  warn: 'text-warn-600',
  bad: 'text-bad-600',
}

export function KpiCard({ label, value, sub, tone = 'default' }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-card p-4 shadow-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</span>
      <span className={`text-2xl font-semibold tabular-nums ${toneStyles[tone]}`}>{value}</span>
      {sub && <span className="text-xs text-ink-500">{sub}</span>}
    </div>
  )
}
