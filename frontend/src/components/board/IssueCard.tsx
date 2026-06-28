import type { Issue } from "../../types/issue.type";
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../../utils/cn'

interface IssueCardProps {
    issue: Issue,
    onClick?: () => void,
    isDragging?: boolean
}

interface SortableIssueCardProps {
  issue: Issue
  onClick?: () => void
}

const PRIORITY_COLOR: Record<Issue['issue_priority'], string> = {
    low: 'text-gray-500',
    medium: 'text-blue-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
}

export function IssueCard({ issue, onClick, isDragging }: IssueCardProps) {
    return (
        <div onClick={onClick} className={cn('bg-white rounded border border-jira-border p-3 cursor-pointer hover:shadow-md transition-shadow', isDragging && 'shadow-lg rotate-1 opacity-90')}>
            <p className="text-xs text-jira-text-subtle font-medium mb-1">
                {issue.issue_key}
            </p>

            <p className="text-sm text-jira-text font-medium leading-snug mb-2">
                {issue.issue_name}
            </p>

            <span className={`text-xs font-medium uppercase ${PRIORITY_COLOR[issue.issue_priority]}`}>
                {issue.issue_priority}
            </span>

        </div>
    )
}

export function SortableIssueCard({ issue, onClick }: SortableIssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.issue_id,           // id duy nhất cho dnd-kit
    data: { issue, status: issue.issue_status },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IssueCard issue={issue} onClick={onClick} isDragging={isDragging} />
    </div>
  )
}