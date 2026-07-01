import { useDraggable } from '@dnd-kit/core'
import type { Issue } from '../../types/issue.types'
import { cn } from '../../utils/cn'
import { BacklogIssueRow } from './BacklogIssueRow'

interface DraggableBacklogIssueRowProps {
  issue: Issue
  onClick: () => void
}

export function DraggableBacklogIssueRow({ issue, onClick }: DraggableBacklogIssueRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: issue.issue_id,
    data: { issue },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 hover:bg-jira-bg transition-colors',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40'
      )}
    >
      <BacklogIssueRow issue={issue} />
    </div>
  )
}
