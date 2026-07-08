import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { TransferRecord } from '../types'
import { DataTable } from '../components/DataTable'
import { Panel } from '../components/Panel'

function fmtCell(v: Date | string | null): string {
  if (v === null) return '-'
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return v
}

const columnHelper = createColumnHelper<TransferRecord>()
const columns = [
  columnHelper.accessor('no', { header: 'No' }),
  columnHelper.accessor('toolNo', { header: 'Tool No' }),
  columnHelper.accessor('partNo', { header: 'Part No' }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (c) => <span className="block max-w-[320px] truncate" title={c.getValue()}>{c.getValue()}</span>,
  }),
  columnHelper.accessor('inSchedule', { header: 'Mold반입일정', cell: (c) => fmtCell(c.getValue()) }),
  columnHelper.accessor('outDate', { header: '재반출일자', cell: (c) => fmtCell(c.getValue()) }),
  columnHelper.accessor('cav', { header: 'Cav' }),
  columnHelper.accessor('note', { header: '비고' }),
]

export function TransferListTab({ records }: { records: TransferRecord[] }) {
  const memoColumns = useMemo(() => columns, [])
  return (
    <Panel title="금형 반입/반출 이력 (MOLD TRANSFER LIST)" sub="금형 이관·반입·반출 기록">
      <DataTable
        data={records}
        columns={memoColumns}
        searchPlaceholder="Tool No, Part No, Description 검색"
      />
    </Panel>
  )
}
