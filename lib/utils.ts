/** Tiny className combiner (no clsx dependency). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Human-readable relative time in Russian (compact). */
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime())
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'только что'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  const d = Math.floor(h / 24)
  return `${d} дн назад`
}
