import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { MaintenanceRecord } from '../types'
import { DataTable } from '../components/DataTable'
import { Panel } from '../components/Panel'
import { RankList } from '../components/RankList'
import { moldsServicedByTechnician, topCauses, type TechnicianMoldStat } from '../lib/analytics'
import { buildNameCanonicalMap, canonicalName } from '../lib/nameMerge'
import { fmtDate, fmtHours, fmtMinutes, fmtNum } from '../lib/format'

const columnHelper = createColumnHelper<MaintenanceRecord>()

const columns = [
  columnHelper.accessor('date', {
    header: '일자',
    cell: (c) => fmtDate(c.getValue()),
    sortingFn: 'datetime',
  }),
  columnHelper.accessor('toolNo', { header: 'Tool No' }),
  columnHelper.accessor('partNo', { header: 'Part No' }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (c) => <span className="block max-w-[280px] truncate" title={c.getValue()}>{c.getValue()}</span>,
  }),
  columnHelper.accessor('qty', { header: '생산량(M)', cell: (c) => fmtNum(c.getValue()) }),
  columnHelper.accessor('pmContent', { header: 'PM내용' }),
  columnHelper.accessor('maintReason', { header: '정비사유' }),
  columnHelper.accessor('defectArea', { header: 'Defect Area' }),
  columnHelper.accessor('defectType', { header: 'Defect Type' }),
  columnHelper.accessor('cause', {
    header: '원인 및 문제점',
    cell: (c) => <span className="block max-w-[220px] truncate" title={c.getValue()}>{c.getValue()}</span>,
  }),
  columnHelper.accessor('solution', { header: '문제해결' }),
  columnHelper.accessor('workContent', {
    header: '작업내용',
    cell: (c) => <span className="block max-w-[220px] truncate" title={c.getValue()}>{c.getValue()}</span>,
  }),
  columnHelper.accessor('repairHours', { header: '정비시간', cell: (c) => fmtHours(c.getValue()) }),
  columnHelper.accessor('technician', { header: '정비담당자' }),
  columnHelper.accessor('requester', { header: '정비의뢰자' }),
  columnHelper.accessor('mttr', { header: 'MTTR', cell: (c) => fmtMinutes(c.getValue()) }),
  columnHelper.accessor('mtbf', { header: 'MTBF', cell: (c) => fmtMinutes(c.getValue()) }),
]

const moldColumnHelper = createColumnHelper<TechnicianMoldStat>()
const moldColumns = [
  moldColumnHelper.accessor('toolNo', { header: 'Tool No' }),
  moldColumnHelper.accessor('partNo', { header: 'Part No' }),
  moldColumnHelper.accessor('description', {
    header: 'Description',
    cell: (c) => <span className="block max-w-[360px] truncate" title={c.getValue()}>{c.getValue()}</span>,
  }),
  moldColumnHelper.accessor('count', { header: '정비 횟수' }),
  moldColumnHelper.accessor('totalHours', { header: '누적 정비시간', cell: (c) => fmtHours(c.getValue()) }),
  moldColumnHelper.accessor('lastDate', { header: '최근 정비일', cell: (c) => fmtDate(c.getValue()), sortingFn: 'datetime' }),
]

export function MaintenanceRecordsTab({
  records,
  title,
  sub,
}: {
  records: MaintenanceRecord[]
  title: string
  sub?: string
}) {
  const memoColumns = useMemo(() => columns, [])
  const memoMoldColumns = useMemo(() => moldColumns, [])
  const [filtered, setFiltered] = useState<MaintenanceRecord[]>(records)
  const [query, setQuery] = useState('')

  const isFiltered = filtered.length !== records.length
  const causes = useMemo(() => topCauses(filtered, 8), [filtered])

  const techNameMap = useMemo(
    () => buildNameCanonicalMap(records.map((r) => r.technician).filter(Boolean)),
    [records],
  )

  const technicianMatch = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || filtered.length === 0) return null
    const canonicalSet = new Set(
      filtered.map((r) => (r.technician ? canonicalName(techNameMap, r.technician) : '')).filter(Boolean),
    )
    if (canonicalSet.size !== 1) return null
    const [name] = [...canonicalSet]
    const matchesName = name.toLowerCase().includes(q) || q.includes(name.toLowerCase())
    return matchesName ? name : null
  }, [filtered, query, techNameMap])

  const molds = useMemo(
    () => (technicianMatch ? moldsServicedByTechnician(records, techNameMap, technicianMatch) : []),
    [technicianMatch, records, techNameMap],
  )

  return (
    <div className="flex flex-col gap-4">
      {technicianMatch ? (
        <Panel
          title={`${technicianMatch}님이 정비한 금형 목록`}
          sub={`총 ${molds.length.toLocaleString()}종의 금형을 정비했습니다. (정비 횟수 기준이 아닌 최근 정비일 기준 정렬)`}
        >
          <DataTable
            data={molds}
            columns={memoMoldColumns}
            searchPlaceholder="Tool No, Part No, Description 검색"
            initialSorting={[{ id: 'lastDate', desc: true }]}
          />
        </Panel>
      ) : isFiltered ? (
        <Panel
          title="검색 결과 불량 랭킹"
          sub={`현재 조건에 해당하는 ${filtered.length.toLocaleString()}건을 기준으로 자주 발생한 문제를 집계했습니다.`}
        >
          <div className="max-w-xl">
            <RankList title="원인 및 문제점" items={causes} total={filtered.length} />
          </div>
        </Panel>
      ) : (
        <p className="text-xs text-ink-300">
          검색어를 입력하면 해당 결과에 대한 불량 랭킹이, 담당자 이름을 입력하면 그 담당자가 정비한 금형 목록이 표시됩니다.
        </p>
      )}

      <Panel title={title} sub={sub}>
        <DataTable
          data={records}
          columns={memoColumns}
          searchPlaceholder="Tool No, Part No, 담당자, 원인 등으로 검색"
          initialSorting={[{ id: 'date', desc: true }]}
          onFilteredChange={(rows, q) => {
            setFiltered(rows)
            setQuery(q)
          }}
        />
      </Panel>
    </div>
  )
}
