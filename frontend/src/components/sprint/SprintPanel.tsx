import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, ChevronDown, ChevronRight, Pencil, Play } from 'lucide-react'
import type { Sprint } from '../../types/sprint.types'
import { sprintApi } from '../../api/sprint.api'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { SprintDropZone } from './SprintDropZone'
import { sprintDropId } from './sprintDnd'

interface SprintPanelProps {
  sprint: Sprint
  issueCount: number
  onEdit?: (sprint: Sprint) => void
  defaultOpen?: boolean
  children: React.ReactNode
}

const statusBadge = {
  planned: 'bg-gray-100 text-gray-600',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export function SprintPanel({
  sprint,
  issueCount,
  onEdit,
  defaultOpen = true,
  children,
}: SprintPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (sprint_status: 'planned' | 'active' | 'completed') =>
      sprintApi.changeStatus(sprint.sprint_id, sprint_status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })

  return (
    <div className="bg-white rounded-lg border border-jira-border mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-jira-border">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-semibold text-jira-text"
        >
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {sprint.sprint_name}
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded',
              statusBadge[sprint.sprint_status]
            )}
          >
            {sprint.sprint_status}
          </span>
          <span className="text-jira-text-subtle font-normal">({issueCount} issues)</span>
        </button>

        <div className="flex items-center gap-2">
          {sprint.sprint_status !== 'completed' && onEdit && (
            <button
              type="button"
              title="Edit sprint"
              onClick={() => onEdit(sprint)}
              className="p-1 rounded text-jira-text-subtle hover:text-jira-blue hover:bg-gray-100"
            >
              <Pencil size={14} />
            </button>
          )}
          {sprint.sprint_status === 'planned' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => statusMutation.mutate('active')}
            >
              <Play size={14} />
              Start sprint
            </Button>
          )}
          {sprint.sprint_status === 'active' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => statusMutation.mutate('completed')}
            >
              <CheckCircle size={14} />
              Complete
            </Button>
          )}
        </div>
      </div>

      {open && (
        <SprintDropZone
          id={sprintDropId(sprint.sprint_id)}
          isEmpty={issueCount === 0}
          emptyMessage="Drop issues here"
        >
          {children}
        </SprintDropZone>
      )}
    </div>
  )
}
