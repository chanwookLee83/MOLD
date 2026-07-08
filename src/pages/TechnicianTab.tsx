import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MaintenanceRecord } from '../types'
import { technicianGradeTable, type TechnicianGradeRow } from '../lib/analytics'
import { Panel } from '../components/Panel'
import { DataTable } from '../components/DataTable'
import { GRADE_COLORS } from '../lib/colors'

const columnHelper = createColumnHelper<TechnicianGradeRow>()
const columns = [
  columnHelper.accessor('technician', { header: '담당자' }),
  columnHelper.accessor('C', { header: 'C (0~2H)' }),
  columnHelper.accessor('B', { header: 'B (2.5~4H)' }),
  columnHelper.accessor('A', { header: 'A (4.5~6H)' }),
  columnHelper.accessor('S', { header: 'S (6.5H~)' }),
  columnHelper.accessor('total', { header: '합계' }),
]

export function TechnicianTab({ records }: { records: MaintenanceRecord[] }) {
  const rows = useMemo(() => technicianGradeTable(records), [records])
  const memoColumns = useMemo(() => columns, [])

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="개인별 난이도 수리시간"
        sub="정비 소요시간(정비시간 컬럼) 기준으로 C/B/A/S 난이도 등급을 자동 산출하여 담당자별로 집계한 결과입니다."
      >
        <ResponsiveContainer width="100%" height={Math.max(260, rows.length * 32)}>
          <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 20 }} stackOffset="none">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ee" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7480' }} />
            <YAxis type="category" dataKey="technician" width={70} tick={{ fontSize: 12, fill: '#6b7480' }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dfe4e9' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="C" stackId="g" fill={GRADE_COLORS.C} name="C (0~2H)" />
            <Bar dataKey="B" stackId="g" fill={GRADE_COLORS.B} name="B (2.5~4H)" />
            <Bar dataKey="A" stackId="g" fill={GRADE_COLORS.A} name="A (4.5~6H)" />
            <Bar dataKey="S" stackId="g" fill={GRADE_COLORS.S} name="S (6.5H~)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="담당자별 집계표">
        <DataTable
          data={rows}
          columns={memoColumns}
          searchPlaceholder="담당자 검색"
          initialSorting={[{ id: 'total', desc: true }]}
          pageSize={20}
        />
      </Panel>
    </div>
  )
}
