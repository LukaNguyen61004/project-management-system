import type { IssueStatus, IssuePriority, IssueType  } from '../types/enums'

export const ISSUE_STATUSES: { value: IssueStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
]

export const STATUS_COLUMN_COLORS: Record<IssueStatus, string> = {
  todo: 'border-t-gray-400',
  in_progress: 'border-t-blue-500',
  in_review: 'border-t-purple-500',
  done: 'border-t-green-500',
}

export const ISSUE_PRIORITIES: {
  value: IssuePriority
  label: string
  color: string
}[] = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
]

export const ISSUE_TYPES: { value: IssueType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'story', label: 'Story' },
  { value: 'subtask', label: 'Subtask' },
]