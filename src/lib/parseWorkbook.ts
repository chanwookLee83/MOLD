import * as XLSX from 'xlsx'
import type {
  MaintenanceRecord,
  MoldMasterRecord,
  TransferRecord,
  WorkbookData,
} from '../types'

function toStr(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return v.toISOString()
  return String(v)
    .replace(/[​-‍﻿]/g, '') // strip zero-width/BOM artifacts from copy-pasted cells
    .replace(/\s+/g, ' ')
    .trim()
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const n = Number(String(v).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : null
}

function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === '') return null
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v
  if (typeof v === 'number') {
    const d = XLSX.SSF ? XLSX.SSF.parse_date_code(v) : null
    if (d) return new Date(d.y, d.m - 1, d.d, d.H ?? 0, d.M ?? 0, d.S ?? 0)
  }
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d
}

function rowIsBlank(row: unknown[]): boolean {
  return row.every((c) => c === null || c === undefined || String(c).trim() === '')
}

function findSheet(wb: XLSX.WorkBook, predicate: (name: string) => boolean): string | undefined {
  return wb.SheetNames.find(predicate)
}

function sheetToRows(wb: XLSX.WorkBook, sheetName: string): unknown[][] {
  const ws = wb.Sheets[sheetName]
  if (!ws) return []
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: true }) as unknown[][]
}

function parseMaintenanceSheet(wb: XLSX.WorkBook, sheetName: string, prefix: string): MaintenanceRecord[] {
  const rows = sheetToRows(wb, sheetName)
  const records: MaintenanceRecord[] = []
  // header lives on row index 20 (row 21, 1-indexed); data begins row index 21 (row 22)
  for (let i = 21; i < rows.length; i++) {
    const r = rows[i]
    if (!r || rowIsBlank(r)) continue
    const get = (col: number) => r[col]
    const description = toStr(get(3))
    const toolNo = toStr(get(1))
    const partNo = toStr(get(2))
    const date = toDate(get(0))
    if (!date && !toolNo && !partNo && !description) continue

    records.push({
      id: `${prefix}-${i}`,
      date,
      toolNo,
      partNo,
      description,
      qty: toNum(get(4)),
      qtyCum: toNum(get(5)),
      machineNo: toStr(get(6)),
      pmContent: toStr(get(7)),
      maintReason: toStr(get(8)),
      defectArea: toStr(get(9)),
      defectType: toStr(get(10)),
      defectCav: toStr(get(11)),
      cavBefore: toStr(get(12)),
      cavAfter: toStr(get(13)),
      cause: toStr(get(14)),
      solution: toStr(get(15)),
      partPN: toStr(get(16)),
      workContent: toStr(get(17)),
      repairHours: toNum(get(18)),
      technician: toStr(get(19)),
      requester: toStr(get(20)),
      grade: toNum(get(21)),
      pmCycle: toNum(get(22)),
      pmRate: toNum(get(23)),
      pureRepairHours: toNum(get(27)),
      prodEndAt: toDate(get(29)),
      repairEndAt: toDate(get(30)),
      mttr: toNum(get(31)),
      mtbf: toNum(get(32)),
      lastRepairDate: toDate(get(36)),
    })
  }
  return records
}

function parseMoldMaster(wb: XLSX.WorkBook, sheetName: string): MoldMasterRecord[] {
  const rows = sheetToRows(wb, sheetName)
  const records: MoldMasterRecord[] = []
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i]
    if (!r || rowIsBlank(r)) continue
    const partNo = toStr(r[2])
    const toolNo = toStr(r[1])
    const description = toStr(r[3])
    if (!partNo && !toolNo && !description) continue
    records.push({
      id: `mold-${i}`,
      no: toStr(r[0]),
      toolNo,
      partNo,
      description,
      location: toStr(r[4]),
      status: toStr(r[5]),
      cav: toStr(r[6]),
      note: toStr(r[7]),
      annualRevision: toStr(r[8]),
      flag1: toStr(r[9]),
      flag2: toStr(r[10]),
      cavTotal: toStr(r[12]),
    })
  }
  return records
}

function parseTransferList(wb: XLSX.WorkBook, sheetName: string): TransferRecord[] {
  const rows = sheetToRows(wb, sheetName)
  const records: TransferRecord[] = []
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i]
    if (!r || rowIsBlank(r)) continue
    const partNo = toStr(r[2])
    const toolNo = toStr(r[1])
    const description = toStr(r[3])
    if (!partNo && !toolNo && !description) continue
    records.push({
      id: `transfer-${i}`,
      no: toStr(r[0]),
      toolNo,
      partNo,
      description,
      inSchedule: toDate(r[4]) ?? toStr(r[4]) ?? null,
      outDate: toDate(r[5]) ?? toStr(r[5]) ?? null,
      cav: toStr(r[6]),
      note: toStr(r[7]),
    })
  }
  return records
}

export async function parseWorkbookFile(file: File): Promise<WorkbookData> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })

  const mainSheet = findSheet(wb, (n) => n.includes('RECORD') && (n.includes('사용') || (!n.includes('보조') && !n.includes('archive'))))
  const archiveSheet = findSheet(wb, (n) => n.includes('RECORD') && n.includes('보조'))
  const moldSheet = findSheet(wb, (n) => n.trim() === 'TE')
  const transferSheet = findSheet(wb, (n) => n.includes('TRANSFER'))

  return {
    fileName: file.name,
    loadedAt: new Date(),
    mainRecords: mainSheet ? parseMaintenanceSheet(wb, mainSheet, 'main') : [],
    archiveRecords: archiveSheet ? parseMaintenanceSheet(wb, archiveSheet, 'archive') : [],
    moldMaster: moldSheet ? parseMoldMaster(wb, moldSheet) : [],
    transferList: transferSheet ? parseTransferList(wb, transferSheet) : [],
  }
}
