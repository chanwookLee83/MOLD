import { format, isValid } from 'date-fns'

export function fmtDate(d: Date | null | undefined, pattern = 'yyyy-MM-dd'): string {
  if (!d || !isValid(d)) return '-'
  return format(d, pattern)
}

export function fmtDateTime(d: Date | null | undefined): string {
  return fmtDate(d, 'yyyy-MM-dd HH:mm')
}

export function fmtNum(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-'
  return n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function fmtHours(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-'
  return `${fmtNum(n, n % 1 === 0 ? 0 : 1)}h`
}

export function fmtMinutes(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-'
  return `${fmtNum(n)}분`
}

export function fmtPercent(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-'
  return `${fmtNum(n * (n <= 1 ? 100 : 1), 1)}%`
}
