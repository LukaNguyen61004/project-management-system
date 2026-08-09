import type { IssuePriority } from '../types/enums'

export const PRIORITY_RANK: Record<IssuePriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}