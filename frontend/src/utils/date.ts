import { format, parseISO } from 'date-fns'

export function dateInputToISO(date: string): string | undefined {
  if (!date) return undefined
  return `${date}T00:00:00.000Z`
}

export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}



export function formatSprintDateRange(
  start: string | null,
  end: string | null
): string | null {
  if (!start && !end) return null
  const fmt = (iso: string) => format(parseISO(isoToDateInput(iso)), 'd MMM yyyy')
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `From ${fmt(start)}`
  return `Until ${fmt(end!)}`
}
