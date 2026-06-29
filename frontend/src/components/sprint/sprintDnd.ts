import type { Issue } from '../../types/issue.types'

export const BACKLOG_DROP_ID = 'backlog'
export const sprintDropId = (sprintId: number) => `sprint-${sprintId}`

export function resolveTargetSprintId(
  overId: string | number,
  issues: Issue[]
): number | null | undefined {
  if (overId === BACKLOG_DROP_ID) return null
  if (typeof overId === 'string' && overId.startsWith('sprint-')) {
    return Number(overId.replace('sprint-', ''))
  }
  const overIssue = issues.find((i) => i.issue_id === overId)
  if (overIssue) return overIssue.sprint_id
  return undefined
}
