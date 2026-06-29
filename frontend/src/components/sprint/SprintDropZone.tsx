import { useDroppable } from '@dnd-kit/core'
import { cn } from '../../utils/cn'

interface SprintDropZoneProps {
  id: string
  children: React.ReactNode
  emptyMessage: string
  isEmpty: boolean
}

export function SprintDropZone({ id, children, emptyMessage, isEmpty }: SprintDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[3rem] transition-colors',
        isOver && 'bg-blue-50 ring-2 ring-inset ring-jira-blue/30'
      )}
    >
      {isEmpty ? (
        <p className="text-sm text-jira-text-subtle text-center py-6">{emptyMessage}</p>
      ) : (
        children
      )}
    </div>
  )
}
