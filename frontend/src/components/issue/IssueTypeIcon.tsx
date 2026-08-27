import { Bug, CheckSquare, GitBranch, type LucideIcon } from 'lucide-react'
import type { IssueType } from '../../types/enums'
import { cn } from '../../utils/cn'

const iconMap: Record<IssueType, LucideIcon> = {
  task: CheckSquare,
  bug: Bug,
  subtask: GitBranch,
}

const colorMap: Record<IssueType, string> = {
  task: 'text-blue-500',
  bug: 'text-red-500',
  subtask: 'text-purple-500',
}

interface IssueTypeIconProps {
  type: IssueType
  size?: number
  className?: string
}

export function IssueTypeIcon({ type, size = 16, className }: IssueTypeIconProps) {
  const Icon = iconMap[type] ?? CheckSquare
  return <Icon size={size} className={cn(colorMap[type] ?? colorMap.task, className)} />
}
