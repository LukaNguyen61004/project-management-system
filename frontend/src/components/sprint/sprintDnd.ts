import type { Issue } from '../../types/issue.types'

export const BACKLOG_DROP_ID = 'backlog'
export const sprintDropId = (sprintId: number) => `sprint-${sprintId}`

export function resolveTargetSprintId(
  overId: string | number,
  overData?: unknown,
): number | null | undefined {
  if (overId === BACKLOG_DROP_ID) return null
  if (typeof overId === 'string' && overId.startsWith('sprint-')) {
    return Number(overId.replace('sprint-', ''))
  }
  const issue = (overData as { issue?: Issue } | undefined)?.issue
  if (issue) return issue.sprint_id
  return undefined
}
