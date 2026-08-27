import type { IssueStatus } from "../types/enums";
 const ORDER: IssueStatus[] = ['todo','in_progress', 'in_review', 'done']

 export function getStatusTransitionError(from : IssueStatus, to: IssueStatus, assigneeId: number | null): string | null{
    if (from === to) return null
    const i = ORDER.indexOf(from)
  const j = ORDER.indexOf(to)
  if (Math.abs(i - j) !== 1) {
    return 'Chỉ được chuyển sang cột liền kề (không nhảy cóc, Done không về To Do)'
  }
  if (from === 'todo' && to === 'in_progress' && assigneeId == null) {
    return 'Cần gán người nhận trước khi kéo sang In Progress'
  }
  return null
}
export function getAllowedStatuses(from: IssueStatus, assigneeId: number | null): IssueStatus[] {
  return ORDER.filter((to) => to === from || !getStatusTransitionError(from, to, assigneeId))
}
