import { useRef, useState } from 'react'

interface UploadButtonProps {
  onFile: (file: File) => void
  label?: string
  busy?: boolean
}

export function UploadButton({ onFile, label = '엑셀 업로드', busy }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-gold-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500 disabled:opacity-60"
      >
        {busy ? '불러오는 중...' : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </>
  )
}

export function UploadDropzone({ onFile, busy }: { onFile: (file: File) => void; busy?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) onFile(f)
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-16 text-center transition cursor-pointer ${
        dragOver ? 'border-navy-600 bg-navy-800/5' : 'border-line-strong bg-card'
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-800/10 text-navy-800">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v12m0-12 4 4m-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-ink-900">
          {busy ? '분석 중입니다...' : 'MOLD MAINTENANCE RECORD 엑셀 파일을 올려주세요'}
        </p>
        <p className="mt-1 text-sm text-ink-500">클릭하거나 파일을 이 영역에 끌어다 놓으세요 (.xlsx)</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
