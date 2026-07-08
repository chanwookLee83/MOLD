import { useEffect, useMemo, useRef, useState } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
}

export function SearchInput({ value, onChange, suggestions, placeholder }: SearchInputProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return []
    const starts: string[] = []
    const contains: string[] = []
    for (const s of suggestions) {
      const low = s.toLowerCase()
      if (low === q) continue
      if (low.startsWith(q)) starts.push(s)
      else if (low.includes(q)) contains.push(s)
      if (starts.length >= 8 && contains.length >= 8) break
    }
    return [...starts, ...contains].slice(0, 8)
  }, [value, suggestions])

  useEffect(() => setHighlight(0), [value])

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || matches.length === 0) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setHighlight((h) => Math.min(h + 1, matches.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setHighlight((h) => Math.max(h - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              onChange(matches[highlight])
              setOpen(false)
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-md border border-line bg-card py-2 pl-3 pr-8 text-sm text-ink-900 placeholder:text-ink-300 focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            aria-label="검색어 지우기"
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink-300 transition hover:bg-paper-dim hover:text-ink-700"
          >
            ×
          </button>
        )}
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          {matches.map((m, i) => (
            <li key={m}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(m)
                  setOpen(false)
                }}
                className={`block w-full truncate px-3 py-1.5 text-left text-sm ${
                  i === highlight ? 'bg-gold-100 text-ink-900' : 'text-ink-700 hover:bg-paper-dim'
                }`}
              >
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
