export interface TabDef {
  id: string
  label: string
  count?: number
}

interface TabNavProps {
  tabs: TabDef[]
  active: string
  onChange: (id: string) => void
}

export function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <div className="border-b border-line bg-card px-4">
      <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                isActive ? 'text-navy-800' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                    isActive ? 'bg-gold-100 text-gold-600' : 'bg-paper-dim text-ink-500'
                  }`}
                >
                  {tab.count.toLocaleString()}
                </span>
              )}
              {isActive && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold-500" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
