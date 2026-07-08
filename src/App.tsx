import { useEffect, useState } from 'react'
import type { WorkbookData } from './types'
import { parseWorkbookFile } from './lib/parseWorkbook'
import { loadWorkbookData, saveWorkbookData } from './lib/storage'
import { TabNav, type TabDef } from './components/TabNav'
import { UploadButton, UploadDropzone } from './components/UploadControl'
import { Dashboard } from './pages/Dashboard'
import { MaintenanceRecordsTab } from './pages/MaintenanceRecordsTab'
import { TechnicianTab } from './pages/TechnicianTab'
import { MoldMasterTab } from './pages/MoldMasterTab'
import { TransferListTab } from './pages/TransferListTab'
import { fmtDateTime } from './lib/format'

const TABS: TabDef[] = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'main', label: 'TEK-PM-MOLD RECORD 사용' },
  { id: 'archive', label: '보조자료' },
  { id: 'technician', label: '개인별 난이도 수리시간' },
  { id: 'mold', label: 'TE (금형마스터)' },
  { id: 'transfer', label: 'MOLD TRANSFER LIST' },
]

export default function App() {
  const [data, setData] = useState<WorkbookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    loadWorkbookData()
      .then((d) => {
        if (d) setData(d)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    try {
      const parsed = await parseWorkbookFile(file)
      if (
        parsed.mainRecords.length === 0 &&
        parsed.archiveRecords.length === 0 &&
        parsed.moldMaster.length === 0 &&
        parsed.transferList.length === 0
      ) {
        throw new Error('시트를 인식하지 못했습니다. MOLD MAINTENANCE RECORD 형식의 파일인지 확인해주세요.')
      }
      setData(parsed)
      await saveWorkbookData(parsed)
      setTab('dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : '파일을 처리하는 중 오류가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  const tabsWithCounts: TabDef[] = TABS.map((t) => {
    if (!data) return t
    const counts: Record<string, number> = {
      main: data.mainRecords.length,
      archive: data.archiveRecords.length,
      mold: data.moldMaster.length,
      transfer: data.transferList.length,
    }
    return counts[t.id] !== undefined ? { ...t, count: counts[t.id] } : t
  })

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-navy-900 bg-navy-800">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white sm:text-lg">금형 정비 실적 관리</h1>
            <p className="text-xs text-white/60">MOLD MAINTENANCE RECORD · 주간 실적 보고</p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <span className="hidden text-xs text-white/60 md:inline">
                {data.fileName} · {fmtDateTime(data.loadedAt)} 갱신
              </span>
            )}
            <UploadButton onFile={handleFile} busy={busy} label={data ? '다시 업로드' : '엑셀 업로드'} />
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto mt-3 w-full max-w-[1400px] px-5">
          <div className="rounded-md border border-bad-600/30 bg-bad-100 px-4 py-2.5 text-sm text-bad-600">{error}</div>
        </div>
      )}

      {data && <TabNav tabs={tabsWithCounts} active={tab} onChange={setTab} />}

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-ink-500">불러오는 중...</div>
        ) : !data ? (
          <UploadDropzone onFile={handleFile} busy={busy} />
        ) : (
          <>
            {tab === 'dashboard' && <Dashboard records={data.mainRecords} />}
            {tab === 'main' && (
              <MaintenanceRecordsTab
                records={data.mainRecords}
                title="TEK-PM-MOLD RECORD 사용"
                sub="현재 사용 중인 금형 정비 실적 원장"
              />
            )}
            {tab === 'archive' && (
              <MaintenanceRecordsTab
                records={data.archiveRecords}
                title="TEK-PM-MOLD RECORD (보조자료)"
                sub="과거 정비 실적 아카이브"
              />
            )}
            {tab === 'technician' && <TechnicianTab records={data.mainRecords} />}
            {tab === 'mold' && <MoldMasterTab records={data.moldMaster} />}
            {tab === 'transfer' && <TransferListTab records={data.transferList} />}
          </>
        )}
      </main>

      <footer className="border-t border-line px-5 py-3 text-center text-xs text-ink-300">
        모든 데이터는 브라우저에 로컬로 저장되며 외부로 전송되지 않습니다.
      </footer>
    </div>
  )
}
