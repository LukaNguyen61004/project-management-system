import type { Issue } from '../../types/issue.types'
import type { IssueStatus } from '../../types/enums'
import { cn } from '../../utils/cn'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableIssueCard } from './IssueCard'
import { useT } from '../../i18n/useT'

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
  const t = useT()
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  })

  const issueIds = issues.map((i) => i.issue_id)

  return (
    <div className="flex flex-col w-[278px] shrink-0">
      <div className="flex items-center justify-between mb-3 px-1 border-b border-white/30 pb-2">
        <h3 className="text-sm font-semibold text-jira-text">{label}</h3>
        <span className="text-xs text-white bg-white/15 rounded-full px-2 py-0.5 min-w-5 text-center">
          {issues.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-[200px] rounded-[16px] p-2 space-y-2 transition-colors border border-white/20',
          isOver && 'bg-white/10 ring-2 ring-white/20'
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
          <p className="text-xs text-jira-text-subtle text-center py-8">{t('common.dropHere')}</p>
        )}
      </div>
    </div>
  )
}
