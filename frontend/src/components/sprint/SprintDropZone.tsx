import { useDroppable } from '@dnd-kit/core'
import { cn } from '../../utils/cn'

interface SprintDropZoneProps {
  id: string
  children: React.ReactNode
  emptyMessage: string
  isEmpty: boolean
  disabled?: boolean
}

export function SprintDropZone({
  id,
  children,
  emptyMessage,
  isEmpty,
  disabled = false,
}: SprintDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[3rem] transition-colors',
        !disabled && isOver && 'bg-blue-50 ring-2 ring-inset ring-jira-blue/30',
        disabled && 'opacity-90'
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
