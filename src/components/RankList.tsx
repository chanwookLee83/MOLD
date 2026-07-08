import { vividColor } from '../lib/colors'

interface RankItem {
  code: string
  count: number
}

export function RankList({ title, items, total }: { title: string; items: RankItem[]; total: number }) {
  const max = items[0]?.count ?? 0
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-ink-300">해당 데이터 없음</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((item, idx) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0
            const barPct = max > 0 ? (item.count / max) * 100 : 0
            return (
              <li key={item.code} className="flex flex-col gap-1 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-baseline gap-2 break-words text-ink-900">
                    <span className="shrink-0 text-xs font-semibold text-ink-300">{idx + 1}</span>
                    <span className="break-words">{item.code}</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-ink-500">
                    {item.count.toLocaleString()}건 ({pct.toFixed(1)}%)
                  </span>
                </div>
                <span className="relative h-2.5 w-full overflow-hidden rounded bg-paper-dim">
                  <span
                    className="absolute inset-y-0 left-0 rounded"
                    style={{ width: `${barPct}%`, backgroundColor: vividColor(idx) }}
                  />
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
