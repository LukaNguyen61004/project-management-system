/** Date-only field helpers — avoid local timezone shifting calendar dates. */

/** `2026-06-28` → `2026-06-28T00:00:00.000Z` (UTC midnight, same calendar day) */
export function dateInputToISO(date: string): string | undefined {
  if (!date) return undefined
  return `${date}T00:00:00.000Z`
}

/** ISO from API → `yyyy-MM-dd` for `<input type="date">` */
export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
