import { useDraggable } from '@dnd-kit/core'
import type { Issue } from '../../types/issue.types'
import { cn } from '../../utils/cn'
import { BacklogIssueRow } from './BacklogIssueRow'

interface DraggableBacklogIssueRowProps {
  issue: Issue
  onClick: () => void
  /** false = không cho kéo (vd. issue done trong sprint completed) */
  draggable?: boolean
}

export function DraggableBacklogIssueRow({
  issue,
  onClick,
  draggable = true,
}: DraggableBacklogIssueRowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: issue.issue_id,
    data: { issue },
    disabled: !draggable,
  })

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 hover:bg-jira-bg transition-colors',
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        isDragging && 'opacity-40'
      )}
    >
      <BacklogIssueRow issue={issue} />
    </div>
  )
}
