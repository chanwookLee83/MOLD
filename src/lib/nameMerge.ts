// Groups likely-typo name variants (e.g. "이경혀" vs "이경현") under the more
// frequent spelling, so a single mistyped character doesn't fork one person
// into two rows in technician summaries. Only merges when the rare variant's
// count is small relative to the dominant spelling — two names that both
// occur often (e.g. "김도환" vs "김태환") are almost certainly different
// people and are left alone.
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

export function buildNameCanonicalMap(names: string[]): Map<string, string> {
  const counts = new Map<string, number>()
  for (const name of names) {
    if (!name) continue
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const canonical = new Map<string, string>()
  const used = new Set<string>()

  for (const [name, count] of sorted) {
    if (used.has(name)) continue
    canonical.set(name, name)
    used.add(name)
    for (const [other, otherCount] of sorted) {
      if (used.has(other)) continue
      if (other.length !== name.length) continue
      if (other.length < 2 || other.length > 6) continue
      const rareThreshold = Math.max(2, count * 0.05)
      if (otherCount > rareThreshold) continue
      if (levenshtein(name, other) === 1) {
        canonical.set(other, name)
        used.add(other)
      }
    }
  }
  return canonical
}

export function canonicalName(map: Map<string, string>, name: string): string {
  return map.get(name) ?? name
}
