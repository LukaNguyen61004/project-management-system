import type { Issue } from '../../types/issue.types'
import type { IssueStatus } from '../../types/enums'
import { STATUS_COLUMN_COLORS } from '../../utils/constants'
import { IssueCard } from './IssueCard'
import { cn } from '../../utils/cn'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableIssueCard } from './IssueCard'   // thay IssueCard

interface KanbanColumnProps {
  status: IssueStatus
  label: string
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function KanbanColumn({
  status,
  label,
  issues,
  onIssueClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,        // 'todo', 'in_progress', ...
    data: { status },
  })

  const issueIds = issues.map((i) => i.issue_id)

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Header cột: tên + số lượng + viền màu trên */}
      <div
        className={cn(
          'flex items-center justify-between mb-3 px-1',
          'border-t-4 pt-2 rounded-t',
          STATUS_COLUMN_COLORS[status]
        )}
      >
        <h3 className="text-sm font-semibold text-jira-text">{label}</h3>
        <span className="text-xs text-jira-text-subtle bg-gray-200 rounded-full px-2 py-0.5">
          {issues.length}
        </span>
      </div>
      {/* Vùng chứa card */}
        <div ref={setNodeRef}
             className={cn(
            'flex-1 min-h-[200px] rounded-lg p-2 space-y-2 transition-colors bg-jira-bg/80',
            isOver && 'bg-jira-blue-light/50 ring-2 ring-jira-blue/30'
          )}
        >
          <SortableContext items={issueIds} strategy={verticalListSortingStrategy}>
            {issues.map((issue) => (
              <SortableIssueCard
                key={issue.issue_id}
                issue={issue}
                onClick={() => onIssueClick(issue)}
              />
            ))}
          </SortableContext>

          {issues.length === 0 && (
            <p className="text-xs text-jira-text-subtle text-center py-8">Drop issues here</p>
          )}
        </div>
      </div>
  )
}