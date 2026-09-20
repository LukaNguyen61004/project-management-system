import type { IssueStatus } from "../types/enums";
import { t } from "../i18n/useT";

const ORDER: IssueStatus[] = ['todo','in_progress', 'in_review', 'done']

export function getStatusTransitionError(from : IssueStatus, to: IssueStatus, assigneeId: number | null): string | null{
    if (from === to) return null
    const i = ORDER.indexOf(from)
  const j = ORDER.indexOf(to)
  if (Math.abs(i - j) !== 1) {
    return t('board.adjacent')
  }
  if (from === 'todo' && to === 'in_progress' && assigneeId == null) {
    return t('board.needAssignee')
  }
  return null
}
export function getAllowedStatuses(from: IssueStatus, assigneeId: number | null): IssueStatus[] {
  return ORDER.filter((to) => to === from || !getStatusTransitionError(from, to, assigneeId))
}
