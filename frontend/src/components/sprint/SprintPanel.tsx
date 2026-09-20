import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { CheckCircle, ChevronDown, ChevronRight, Pencil, Play, Sparkles } from 'lucide-react'
import type { Sprint } from '../../types/sprint.types'
import { sprintApi } from '../../api/sprint.api'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { SprintDropZone } from './SprintDropZone'
import { sprintDropId } from './sprintDnd'
import { SprintSummaryModal } from './SprintSummaryModal'
import type { SprintSummaryResult } from '../../api/ai.api'
import { fetchIssueList, issueListKey } from '../../api/issue.api'
import { aiApi } from '../../api/ai.api'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../utils/apiError'
import type { Issue } from '../../types/issue.types'
import { EMPTY_ISSUE_FILTERS, type IssueFilters } from '../../types/issueFilter.types'
import { useIssueFilters } from '../../hooks/useIssueFilters'
import { DraggableBacklogIssueRow } from '../backlog/DraggableBacklogIssueRow'
import { CompleteSprintModal } from './CompleteSprintModal'
import { useT } from '../../i18n/useT'

interface SprintPanelProps {
  projectId: number
  sprint: Sprint
  sprints: Sprint[]
  onIssueClick: (issue: Issue) => void
  onEdit?: (sprint: Sprint) => void
  defaultOpen?: boolean
  filters?: IssueFilters
}

const statusBadge = {
  planned: 'bg-gray-100 text-gray-600',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

export function SprintPanel({
  projectId,
  sprint,
  sprints,
  onEdit,
  onIssueClick,
  defaultOpen = true,
  filters = EMPTY_ISSUE_FILTERS,
}: SprintPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const queryClient = useQueryClient()
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryData, setSummaryData] = useState<SprintSummaryResult | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [completeOpen, setCompleteOpen] = useState(false)
  const t = useT()

  const statusMutation = useMutation({
    mutationFn: ({
      sprint_status,
      move_incomplete_to,
    }: {
      sprint_status: 'planned' | 'active' | 'completed'
      move_incomplete_to?: number | null
    }
    ) =>
      sprintApi.changeStatus(sprint.sprint_id, sprint_status, { move_incomplete_to }),
    onSuccess: (_data, vars) => {
      const label =
        vars.sprint_status === 'active'
          ? t('sprint.started')
          : vars.sprint_status === 'completed'
            ? t('sprint.completedToast')
            : t('sprint.updated')
      toast.success(label)
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('sprint.updateFailed'))),
  })

  const { data, isLoading } = useQuery({
    queryKey: issueListKey.sprint(projectId, sprint.sprint_id),
    queryFn: () =>
      fetchIssueList(projectId, {
        sprint_id: sprint.sprint_id,
        page: 1,
        limit: 100,
      }),
    enabled: !!projectId,
  })

  const issues = data?.issues ?? []

  const incomplete = issues.filter((i) => i.issue_status !== 'done')
  const plannedSprints = sprints.filter(
    (s) => s.sprint_status === 'planned' && s.sprint_id !== sprint.sprint_id
  )

  const filtered = useIssueFilters(issues, filters)
  const issueCount = data?.pagination.total ?? issues.length

  const runComplete = async (moveTo?: number | null) => {
    try {
      await statusMutation.mutateAsync({
        sprint_status: 'completed',
        ...(moveTo !== undefined ? { move_incomplete_to: moveTo } : {}),
      })
      setCompleteOpen(false)
      setSummaryOpen(true)
      setSummaryLoading(true)
      setSummaryError(null)
      setSummaryData(null)
      const res = await aiApi.summarizeSprint(sprint.sprint_id)
      setSummaryData(res.data.data)
    } catch (err) {
      setSummaryOpen(true)
      setSummaryData(null)
      setSummaryError(getApiErrorMessage(err, t('sprint.summaryFailed')))
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleCompleteClick = () => {
    if (incomplete.length > 0) {
      setCompleteOpen(true)
      return
    }
    void runComplete()
  }
  const handleViewSummary = async () => {
    setSummaryOpen(true)
    setSummaryLoading(true)
    setSummaryError(null)
    setSummaryData(null)
    try {
      const res = await aiApi.summarizeSprint(sprint.sprint_id)
      setSummaryData(res.data.data)
    } catch (err) {
      setSummaryData(null)
      setSummaryError(getApiErrorMessage(err, t('sprint.summaryFailed')))
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="cinder-glass rounded-[20px] mb-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-semibold text-jira-text min-w-0 flex-wrap"
        >
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {sprint.sprint_name}
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded',
              statusBadge[sprint.sprint_status]
            )}
          >
            {t(`sprintStatus.${sprint.sprint_status}`)}
          </span>
          <span className="text-jira-text-subtle font-normal">{t('common.issueCount', { count: issueCount })}</span>
        </button>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {sprint.sprint_status !== 'completed' && onEdit && (
            <button
              type="button"
              title={t('sprint.edit')}
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
              onClick={() => statusMutation.mutate({ sprint_status: 'active' })}
            >
              <Play size={14} />
              {t('sprint.start')}
            </Button>
          )}
          {sprint.sprint_status === 'active' && (
            <Button size="sm" variant="secondary" onClick={handleCompleteClick}
              disabled={statusMutation.isPending || summaryLoading}>
              <CheckCircle size={14} />
              {t('sprint.complete')}
            </Button>
          )}

          {sprint.sprint_status === 'completed' && (
            <Button size="sm" variant="secondary" onClick={handleViewSummary}>
              <Sparkles size={14} />
              {t('sprint.summary')}
            </Button>
          )}
        </div>
      </div>

      {open && (
        <SprintDropZone
          id={sprintDropId(sprint.sprint_id)}
          isEmpty={!isLoading && filtered.length === 0}
          emptyMessage={
            sprint.sprint_status === 'completed'
              ? t('sprint.dropLocked')
              : t('common.dropHere')
          }
          disabled={sprint.sprint_status === 'completed'}
        >
          {isLoading ? (
            <p className="text-sm text-jira-text-subtle text-center py-6">{t('backlog.loadingIssues')}</p>
          ) : (
            <div className="divide-y divide-jira-border">
              {filtered.map((issue) => {
                const lockedInCompleted =
                  sprint.sprint_status === 'completed' && issue.issue_status === 'done'
                return (
                  <DraggableBacklogIssueRow
                    key={issue.issue_id}
                    issue={issue}
                    onClick={() => onIssueClick(issue)}
                    draggable={!lockedInCompleted}
                  />
                )
              })}
            </div>
          )}
        </SprintDropZone>
      )}
      <CompleteSprintModal
        open={completeOpen}
        sprintName={sprint.sprint_name}
        incompleteCount={incomplete.length}
        plannedSprints={plannedSprints}
        onClose={() => setCompleteOpen(false)}
        onConfirm={(moveTo) => void runComplete(moveTo)}
        isPending={statusMutation.isPending}
      />
      
      <SprintSummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        sprintName={sprint.sprint_name}
        data={summaryData}
        loading={summaryLoading}
        error={summaryError}
      />

    </div>
  )
}
