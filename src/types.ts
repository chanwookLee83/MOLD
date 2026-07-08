export interface MaintenanceRecord {
  id: string
  date: Date | null
  toolNo: string
  partNo: string
  description: string
  qty: number | null
  qtyCum: number | null
  machineNo: string
  pmContent: string
  maintReason: string
  defectArea: string
  defectType: string
  defectCav: string
  cavBefore: string
  cavAfter: string
  cause: string
  solution: string
  partPN: string
  workContent: string
  repairHours: number | null
  technician: string
  requester: string
  grade: number | null
  pmCycle: number | null
  pmRate: number | null
  pureRepairHours: number | null
  prodEndAt: Date | null
  repairEndAt: Date | null
  mttr: number | null
  mtbf: number | null
  lastRepairDate: Date | null
}

export interface MoldMasterRecord {
  id: string
  no: string
  toolNo: string
  partNo: string
  description: string
  location: string
  status: string
  cav: string
  note: string
  annualRevision: string
  flag1: string
  flag2: string
  cavTotal: string
}

export interface TransferRecord {
  id: string
  no: string
  toolNo: string
  partNo: string
  description: string
  inSchedule: Date | string | null
  outDate: Date | string | null
  cav: string
  note: string
}

export interface WorkbookData {
  fileName: string
  loadedAt: Date
  mainRecords: MaintenanceRecord[]
  archiveRecords: MaintenanceRecord[]
  moldMaster: MoldMasterRecord[]
  transferList: TransferRecord[]
}

export const DIFFICULTY_GRADES = ['C', 'B', 'A', 'S'] as const
export type DifficultyGrade = (typeof DIFFICULTY_GRADES)[number]

export function gradeForHours(hours: number | null): DifficultyGrade | null {
  if (hours === null || Number.isNaN(hours)) return null
  if (hours <= 2) return 'C'
  if (hours <= 4) return 'B'
  if (hours <= 6) return 'A'
  return 'S'
}

export const GRADE_LABELS: Record<DifficultyGrade, string> = {
  C: 'C (0~2H)',
  B: 'B (2.5~4H)',
  A: 'A (4.5~6H)',
  S: 'S (6.5H~)',
}
