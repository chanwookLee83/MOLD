// Vivid, high-contrast categorical palette so adjacent series/bars are easy
// to tell apart at a glance (previous ochre/gold-heavy palette blended together).
export const VIVID_PALETTE = [
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#f59e0b', // amber
  '#7c3aed', // violet
  '#0891b2', // teal
  '#db2777', // pink
  '#65a30d', // lime
  '#ea580c', // orange
  '#4f46e5', // indigo
]

export function vividColor(index: number): string {
  return VIVID_PALETTE[index % VIVID_PALETTE.length]
}

export const GRADE_COLORS: Record<'C' | 'B' | 'A' | 'S', string> = {
  C: '#2563eb', // blue — lightest workload
  B: '#16a34a', // green
  A: '#f59e0b', // amber
  S: '#dc2626', // red — heaviest workload
}
