import type { Issue } from "../../types/issue.types";
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../../utils/cn'
import { IssueWarningBadge } from '../issue/IssueWarningBadge'
import { EpicBadge } from "../epic/EpicBadge";

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
  low: 'text-white/50',
  medium: 'text-sky-300',
  high: 'text-[#dbd215]',
}

export function IssueCard({ issue, onClick, isDragging }: IssueCardProps) {
  return (
    <div onClick={onClick} className={cn('cinder-glass rounded-2xl p-3 cursor-pointer hover:opacity-70 hover:bg-white/10 transition-all', isDragging && 'shadow-lg rotate-1 opacity-90')}>
      <p className="text-xs text-white/50 font-medium mb-1">
        {issue.issue_key}
      </p>

      <p className="text-sm text-jira-text font-medium leading-snug mb-2">
        {issue.issue_name}
      </p>

      {issue.epic && (
        <EpicBadge name={issue.epic.epic_name} color={issue.epic.epic_color} />
      )}

      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium uppercase ${PRIORITY_COLOR[issue.issue_priority] ?? PRIORITY_COLOR.high}`}>
          {issue.issue_priority}
        </span>
        <IssueWarningBadge issue={issue} />
      </div>

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
    opacity: isDragging ? 0 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IssueCard issue={issue} onClick={onClick} />
    </div>
  )
}