import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { MoldMasterRecord } from '../types'
import { DataTable } from '../components/DataTable'
import { Panel } from '../components/Panel'

const columnHelper = createColumnHelper<MoldMasterRecord>()
const columns = [
  columnHelper.accessor('no', { header: 'No' }),
  columnHelper.accessor('toolNo', { header: 'Tool No' }),
  columnHelper.accessor('partNo', { header: 'Part No' }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (c) => <span className="block max-w-[320px] truncate" title={c.getValue()}>{c.getValue()}</span>,
  }),
  columnHelper.accessor('location', { header: '위치/색상' }),
  columnHelper.accessor('status', { header: '상태' }),
  columnHelper.accessor('cav', { header: 'Cav' }),
  columnHelper.accessor('note', { header: '비고' }),
  columnHelper.accessor('cavTotal', { header: 'Cav 합계' }),
]

export function MoldMasterTab({ records }: { records: MoldMasterRecord[] }) {
  const memoColumns = useMemo(() => columns, [])
  return (
    <Panel title="금형 Tool/Part 마스터 (TE)" sub="정비 실적 시트의 Tool No / Description VLOOKUP 기준 데이터">
      <DataTable
        data={records}
        columns={memoColumns}
        searchPlaceholder="Tool No, Part No, Description 검색"
      />
    </Panel>
  )
}
