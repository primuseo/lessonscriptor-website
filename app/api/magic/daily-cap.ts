// Per-user daily cap on Magic requests. In memory on purpose: production runs
// as a single container and Upstash is not configured there, so the shared
// checkRateLimit() lets everything through. A redeploy resets the counts,
// which is fine for a cost guard.

export const DAILY_MAGIC_LIMIT = 300

const counts = new Map<string, { day: number; count: number }>()

export function takeDailySlot(email: string, now = Date.now(), limit = DAILY_MAGIC_LIMIT): boolean {
  const day = Math.floor(now / 86_400_000)
  const entry = counts.get(email)
  if (!entry || entry.day !== day) {
    if (counts.size > 10_000) counts.clear()
    counts.set(email, { day, count: 1 })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}
