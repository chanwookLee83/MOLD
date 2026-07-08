import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { SearchInput } from './SearchInput'

const MAX_SUGGESTION_FIELD_LENGTH = 40

function extractSuggestions<T>(data: T[]): string[] {
  const set = new Set<string>()
  for (const row of data as Record<string, unknown>[]) {
    for (const key in row) {
      const v = row[key]
      if (typeof v === 'string') {
        const s = v.trim()
        if (s && s.length <= MAX_SUGGESTION_FIELD_LENGTH) set.add(s)
      } else if (typeof v === 'number' && Number.isFinite(v)) {
        set.add(String(v))
      }
    }
  }
  return [...set]
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  searchPlaceholder?: string
  initialSorting?: SortingState
  pageSize?: number
  onFilteredChange?: (rows: T[], query: string) => void
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = '검색...',
  initialSorting = [],
  pageSize = 25,
  onFilteredChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const suggestions = useMemo(() => extractSuggestions(data), [data])

  const rows = table.getRowModel().rows
  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex

  const total = data.length
  const filtered = table.getFilteredRowModel().rows.length

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onFilteredChange?.(
      table.getFilteredRowModel().rows.map((r) => r.original),
      globalFilter,
    )
  }, [data, globalFilter])

  const rangeLabel = useMemo(() => {
    if (filtered === 0) return '0건'
    const start = pageIndex * table.getState().pagination.pageSize + 1
    const end = Math.min(start + rows.length - 1, filtered)
    return `${start.toLocaleString()}–${end.toLocaleString()} / ${filtered.toLocaleString()}건${
      filtered !== total ? ` (전체 ${total.toLocaleString()}건)` : ''
    }`
  }, [filtered, total, rows.length, pageIndex, table])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={globalFilter}
          onChange={setGlobalFilter}
          suggestions={suggestions}
          placeholder={searchPlaceholder}
        />
        <span className="text-xs font-medium text-ink-500">{rangeLabel}</span>
      </div>

      <div className="overflow-auto rounded-lg border border-line bg-card shadow-sm" style={{ maxHeight: '65vh' }}>
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-navy-800">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="whitespace-nowrap border-b border-navy-700 px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-paper select-none first:pl-4 last:pr-4"
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIcon dir={header.column.getIsSorted()} />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-500">
                  표시할 데이터가 없습니다.
                </td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`${idx % 2 === 0 ? 'bg-card' : 'bg-paper-dim/40'} border-b border-line last:border-0 hover:bg-gold-100/60`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-3 py-2 text-ink-700 first:pl-4 last:pr-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <PageButton onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            {'«'}
          </PageButton>
          <PageButton onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            {'‹'}
          </PageButton>
          <span className="px-3 text-xs font-medium text-ink-500">
            {pageIndex + 1} / {pageCount}
          </span>
          <PageButton onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            {'›'}
          </PageButton>
          <PageButton onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
            {'»'}
          </PageButton>
        </div>
      )}
    </div>
  )
}

function SortIcon({ dir }: { dir: false | 'asc' | 'desc' }) {
  if (!dir) return <span className="text-navy-600/40">↕</span>
  return <span className="text-gold-500">{dir === 'asc' ? '↑' : '↓'}</span>
}

function PageButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-8 min-w-8 rounded-md border border-line bg-card px-2 text-sm text-ink-700 transition hover:border-navy-600 hover:text-navy-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-700"
    >
      {children}
    </button>
  )
}
