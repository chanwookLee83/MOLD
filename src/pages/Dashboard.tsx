import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MaintenanceRecord } from '../types'
import { Panel } from '../components/Panel'
import { KpiCard } from '../components/KpiCard'
import {
  computeStats,
  filterByDays,
  gradeDistribution,
  maxDate,
  technicianWorkload,
  topDefectTypes,
  weeklyTrend,
} from '../lib/analytics'
import { fmtDate, fmtNum } from '../lib/format'
import { GRADE_COLORS, vividColor } from '../lib/colors'

const PERIODS = [
  { id: 'all', label: '전체 기간', days: null as number | null },
  { id: '30', label: '최근 30일', days: 30 },
  { id: '7', label: '최근 7일', days: 7 },
]

const TREND_COLOR = vividColor(0)
const DEFECT_COLOR = vividColor(1)
const TECH_COLOR = vividColor(4)

export function Dashboard({ records }: { records: MaintenanceRecord[] }) {
  const [period, setPeriod] = useState('all')
  const days = PERIODS.find((p) => p.id === period)?.days ?? null
  const filtered = useMemo(() => filterByDays(records, days), [records, days])
  const latest = useMemo(() => maxDate(records), [records])

  const stats = useMemo(() => computeStats(filtered), [filtered])
  const trend = useMemo(() => weeklyTrend(filtered, 12), [filtered])
  const grades = useMemo(() => gradeDistribution(filtered), [filtered])
  const defects = useMemo(() => topDefectTypes(filtered, 8), [filtered])
  const techs = useMemo(() => technicianWorkload(filtered, 8), [filtered])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-line bg-card p-1 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                period === p.id ? 'bg-navy-800 text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-ink-500">데이터 기준일: {fmtDate(latest)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="총 정비 건수" value={`${fmtNum(stats.count)}건`} />
        <KpiCard label="총 정비 시간" value={`${fmtNum(stats.totalRepairHours, 1)}h`} />
        <KpiCard label="평균 정비 시간" value={stats.avgRepairHours !== null ? `${fmtNum(stats.avgRepairHours, 1)}h` : '-'} />
        <KpiCard label="MTTR (중앙값)" value={stats.avgMttrMin !== null ? `${fmtNum(stats.avgMttrMin)}분` : '-'} />
        <KpiCard label="MTBF (중앙값)" value={stats.avgMtbfMin !== null ? `${fmtNum(stats.avgMtbfMin)}분` : '-'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="주간 정비 건수 추이" sub="월요일 기준 주차별 정비 건수" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ee" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7480' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7480' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dfe4e9' }} />
              <Line type="monotone" dataKey="count" name="정비 건수" stroke={TREND_COLOR} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="난이도 등급 분포" sub="정비 소요시간 기준 (C/B/A/S)">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={grades} dataKey="count" nameKey="grade" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {grades.map((g) => (
                  <Cell key={g.grade} fill={GRADE_COLORS[g.grade]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dfe4e9' }} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(_v, entry: any) => {
                  const g = grades.find((x) => x.grade === entry.payload.grade)
                  return <span className="text-xs text-ink-700">{g?.label}</span>
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="불량 유형 Top 8" sub="Defect Type 코드 기준 발생 빈도">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={defects} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ee" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7480' }} />
              <YAxis type="category" dataKey="code" width={50} tick={{ fontSize: 12, fill: '#6b7480' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dfe4e9' }} />
              <Bar dataKey="count" name="건수" fill={DEFECT_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="담당자별 처리 현황" sub="정비 건수 기준 상위 담당자">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={techs} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ee" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7480' }} />
              <YAxis type="category" dataKey="technician" width={64} tick={{ fontSize: 12, fill: '#6b7480' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#dfe4e9' }} />
              <Bar dataKey="count" name="정비 건수" fill={TECH_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  )
}
