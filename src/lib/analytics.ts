import { startOfWeek, format } from 'date-fns'
import type { MaintenanceRecord } from '../types'
import { gradeForHours, GRADE_LABELS, type DifficultyGrade } from '../types'
import { buildNameCanonicalMap, canonicalName } from './nameMerge'

export function maxDate(records: MaintenanceRecord[]): Date | null {
  let max: Date | null = null
  for (const r of records) {
    if (r.date && (!max || r.date > max)) max = r.date
  }
  return max
}

export function filterByDays(records: MaintenanceRecord[], days: number | null): MaintenanceRecord[] {
  if (days === null) return records
  const ref = maxDate(records)
  if (!ref) return records
  const cutoff = new Date(ref)
  cutoff.setDate(cutoff.getDate() - days)
  return records.filter((r) => r.date && r.date >= cutoff && r.date <= ref)
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

// MTTR/MTBF are computed in the source workbook from formulas with broken
// external references, which occasionally yield negative or absurdly large
// values. Median (and a sanity bound) keeps a handful of corrupt rows from
// dominating the reported figure.
const MTTR_MTBF_MAX_MINUTES = 60 * 24 * 90 // 90 days
function sanitizedDurations(nums: number[]): number[] {
  return nums.filter((n) => n >= 0 && n <= MTTR_MTBF_MAX_MINUTES)
}

export interface DashboardStats {
  count: number
  totalRepairHours: number
  avgRepairHours: number | null
  avgMttrMin: number | null
  avgMtbfMin: number | null
  technicianCount: number
  totalQty: number
}

export function computeStats(records: MaintenanceRecord[]): DashboardStats {
  const hours = records.map((r) => r.repairHours).filter((n): n is number => n !== null)
  const mttrs = sanitizedDurations(records.map((r) => r.mttr).filter((n): n is number => n !== null))
  const mtbfs = sanitizedDurations(records.map((r) => r.mtbf).filter((n): n is number => n !== null))
  const techNames = records.map((r) => r.technician).filter(Boolean)
  const techMap = buildNameCanonicalMap(techNames)
  const techs = new Set(techNames.map((n) => canonicalName(techMap, n)))
  const qty = records.map((r) => r.qty).filter((n): n is number => n !== null)

  return {
    count: records.length,
    totalRepairHours: hours.reduce((a, b) => a + b, 0),
    avgRepairHours: avg(hours),
    avgMttrMin: median(mttrs),
    avgMtbfMin: median(mtbfs),
    technicianCount: techs.size,
    totalQty: qty.reduce((a, b) => a + b, 0),
  }
}

function splitCodes(raw: string): string[] {
  return raw
    .split(/[,\/]/)
    .map((s) => s.trim())
    .filter((s) => s && s !== '00')
}

export interface CodeCount {
  code: string
  count: number
}

export function topDefectAreas(records: MaintenanceRecord[], limit = 8): CodeCount[] {
  const tally = new Map<string, number>()
  for (const r of records) {
    for (const code of splitCodes(r.defectArea)) {
      tally.set(code, (tally.get(code) ?? 0) + 1)
    }
  }
  return [...tally.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function topDefectTypes(records: MaintenanceRecord[], limit = 8): CodeCount[] {
  const tally = new Map<string, number>()
  for (const r of records) {
    for (const code of splitCodes(r.defectType)) {
      tally.set(code, (tally.get(code) ?? 0) + 1)
    }
  }
  return [...tally.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function topCauses(records: MaintenanceRecord[], limit = 8): CodeCount[] {
  const tally = new Map<string, number>()
  for (const r of records) {
    const parts = r.cause
      .split(/[,\/]/)
      .map((s) => s.trim())
      .filter(Boolean)
    for (const code of parts) {
      tally.set(code, (tally.get(code) ?? 0) + 1)
    }
  }
  return [...tally.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export interface TechnicianStat {
  technician: string
  count: number
  totalHours: number
}

export interface TechnicianMoldStat {
  toolNo: string
  partNo: string
  description: string
  count: number
  totalHours: number
  lastDate: Date | null
}

export function moldsServicedByTechnician(
  records: MaintenanceRecord[],
  nameMap: Map<string, string>,
  canonicalTechnician: string,
): TechnicianMoldStat[] {
  const map = new Map<string, TechnicianMoldStat>()
  for (const r of records) {
    if (!r.technician) continue
    if (canonicalName(nameMap, r.technician) !== canonicalTechnician) continue
    const key = `${r.toolNo}__${r.partNo}`
    const entry = map.get(key) ?? {
      toolNo: r.toolNo,
      partNo: r.partNo,
      description: r.description,
      count: 0,
      totalHours: 0,
      lastDate: null,
    }
    entry.count += 1
    entry.totalHours += r.repairHours ?? 0
    if (r.date && (!entry.lastDate || r.date > entry.lastDate)) entry.lastDate = r.date
    map.set(key, entry)
  }
  return [...map.values()].sort((a, b) => (b.lastDate?.getTime() ?? 0) - (a.lastDate?.getTime() ?? 0))
}

export function technicianWorkload(records: MaintenanceRecord[], limit = 12): TechnicianStat[] {
  const nameMap = buildNameCanonicalMap(records.map((r) => r.technician).filter(Boolean))
  const map = new Map<string, TechnicianStat>()
  for (const r of records) {
    if (!r.technician) continue
    const technician = canonicalName(nameMap, r.technician)
    const entry = map.get(technician) ?? { technician, count: 0, totalHours: 0 }
    entry.count += 1
    entry.totalHours += r.repairHours ?? 0
    map.set(technician, entry)
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit)
}

export interface GradeStat {
  grade: DifficultyGrade
  label: string
  count: number
}

export function gradeDistribution(records: MaintenanceRecord[]): GradeStat[] {
  const tally: Record<DifficultyGrade, number> = { C: 0, B: 0, A: 0, S: 0 }
  for (const r of records) {
    const g = gradeForHours(r.repairHours)
    if (g) tally[g] += 1
  }
  return (Object.keys(tally) as DifficultyGrade[]).map((grade) => ({
    grade,
    label: GRADE_LABELS[grade],
    count: tally[grade],
  }))
}

export interface TechnicianGradeRow {
  technician: string
  C: number
  B: number
  A: number
  S: number
  total: number
}

export function technicianGradeTable(records: MaintenanceRecord[]): TechnicianGradeRow[] {
  const nameMap = buildNameCanonicalMap(records.map((r) => r.technician).filter(Boolean))
  const map = new Map<string, TechnicianGradeRow>()
  for (const r of records) {
    if (!r.technician) continue
    const technician = canonicalName(nameMap, r.technician)
    const g = gradeForHours(r.repairHours)
    const entry = map.get(technician) ?? { technician, C: 0, B: 0, A: 0, S: 0, total: 0 }
    if (g) entry[g] += 1
    entry.total += 1
    map.set(technician, entry)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

export interface WeeklyCount {
  week: string
  count: number
}

export function weeklyTrend(records: MaintenanceRecord[], weeks = 10): WeeklyCount[] {
  const map = new Map<string, number>()
  for (const r of records) {
    if (!r.date) continue
    const wk = format(startOfWeek(r.date, { weekStartsOn: 1 }), 'MM/dd')
    map.set(wk, (map.get(wk) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([week, count]) => ({ week, count }))
    .slice(-weeks)
}
