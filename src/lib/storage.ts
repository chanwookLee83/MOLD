import { get, set, del } from 'idb-keyval'
import type { WorkbookData } from '../types'

const KEY = 'mold-maintenance-workbook'

export async function saveWorkbookData(data: WorkbookData): Promise<void> {
  await set(KEY, data)
}

export async function loadWorkbookData(): Promise<WorkbookData | null> {
  const data = await get<WorkbookData>(KEY)
  return data ?? null
}

export async function clearWorkbookData(): Promise<void> {
  await del(KEY)
}
