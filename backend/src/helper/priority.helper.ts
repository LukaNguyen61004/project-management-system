import { IssuePriority } from "@prisma/client";

export const PRIORITY_RANK: Record<IssuePriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}


export const isPriorityLower = (a: IssuePriority, b: IssuePriority) => PRIORITY_RANK[a] < PRIORITY_RANK[b]