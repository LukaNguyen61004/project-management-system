import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, ChevronDown, ChevronRight, Pencil, Play, Sparkles } from 'lucide-react'
import type { Sprint } from '../../types/sprint.types'
import { sprintApi } from '../../api/sprint.api'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { SprintDropZone } from './SprintDropZone'
import { sprintDropId } from './sprintDnd'
import { SprintSummaryModal } from './SprintSummaryModal'
import type { SprintSummaryResult } from '../../api/ai.api'
import { aiApi } from '../../api/ai.api'


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
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryData, setSummaryData] = useState<SprintSummaryResult | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const statusMutation = useMutation({
    mutationFn: (sprint_status: 'planned' | 'active' | 'completed') =>
      sprintApi.changeStatus(sprint.sprint_id, sprint_status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })

  const handleComplete = async () => {
    try {
      // 1. Complete sprint
      await statusMutation.mutateAsync('completed')
      // 2. Gọi AI summary
      setSummaryOpen(true)
      setSummaryLoading(true)
      const res = await aiApi.summarizeSprint(sprint.sprint_id)
      setSummaryData(res.data.data)
    } catch {
      // Complete OK nhưng AI fail → vẫn mở modal báo lỗi
      setSummaryOpen(true)
      setSummaryData(null)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleViewSummary = async () => {
    setSummaryOpen(true)
    setSummaryLoading(true)
    try {
      const res = await aiApi.summarizeSprint(sprint.sprint_id)
      setSummaryData(res.data.data)
    } catch {
      setSummaryData(null)
    } finally {
      setSummaryLoading(false)
    }
  }

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
            <Button size="sm" variant="secondary" onClick={handleComplete}
              disabled={statusMutation.isPending || summaryLoading}>
              <CheckCircle size={14} />
              Complete
            </Button>
          )}

          {sprint.sprint_status === 'completed' && (
            <Button size="sm" variant="secondary" onClick={handleViewSummary}>
              <Sparkles size={14} />
              Summary
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

      <SprintSummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        sprintName={sprint.sprint_name}
        data={summaryData}
        loading={summaryLoading}
      />

    </div>
  )
}
