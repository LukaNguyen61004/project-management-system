import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { sprintApi } from '../api/sprint.api'
import { epicApi } from '../api/epic.api'
import { projectApi } from '../api/project.api'
import { KanbanBoard } from '../components/board/KanbanBoard'
import { CreateIssueModal } from '../components/issue/CreateIssueModal'
import { IssueDetailPanel } from '../components/issue/IssueDetailPanel'
import { IssueFilterBar } from '../components/issue/IssueFilterBar'
import { Button } from '../components/ui/Button'
import type { Issue } from '../types/issue.types'
import { formatSprintDateRange } from '../utils/date'
import { useIssueFilters } from '../hooks/useIssueFilters'
import { EMPTY_ISSUE_FILTERS } from '../types/issueFilter.types'
import { Plus, ChevronDown } from 'lucide-react'
import { fetchIssueList, issueListKey } from '../api/issue.api'
import { useT } from '../i18n/useT'

export function BoardPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [filters, setFilters] = useState(EMPTY_ISSUE_FILTERS)
  const [searchParams, setSearchParams] = useSearchParams()
  const [parentIssueForCreate, setParentIssueForCreate] = useState<Issue | null>(null)
  const t = useT()
  const selectClass =
    'appearance-none rounded-3xl border border-jira-border pl-3 pr-8 py-1.5 text-sm bg-transparent text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/25 w-full sm:w-max max-w-full'

  const { data: sprints = [], isLoading: sprintsLoading } = useQuery({
    queryKey: ['sprints', pid],
    queryFn: () => sprintApi.getByProject(pid).then((r) => r.data.data),
    enabled: !!pid,
  })

  type BoardScope = number | 'all'

  const [pickedScope, setPickedScope] = useState<BoardScope | undefined>(undefined)

  const defaultScope: BoardScope =
    sprints.find((s) => s.sprint_status === 'active')?.sprint_id ?? 'all'

  const boardScope = pickedScope ?? defaultScope

  const selectedSprint =
    boardScope === 'all' ? undefined : sprints.find((s) => s.sprint_id === boardScope)

  const { data, isLoading, isError } = useQuery({
    queryKey:
      boardScope === 'all'
        ? issueListKey.all(pid)
        : issueListKey.sprint(pid, boardScope),
    queryFn: () =>
      fetchIssueList(pid, {
        page: 1,
        limit: 100,
        ...(boardScope === 'all' ? {} : { sprint_id: boardScope }),
      }),
    enabled: !!pid && !sprintsLoading,
  })

  const issues = data?.issues ?? []
  const canCreateBug = issues.some((i) => i.issue_status === 'done')
  const filteredBoardIssues = useIssueFilters(issues, filters)


  const { data: epics = [] } = useQuery({
    queryKey: ['epics', pid],
    queryFn: () => epicApi.getByProject(pid).then((r) => r.data.data),
    enabled: !!pid,
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members', pid],
    queryFn: () => projectApi.getMembers(pid).then((r) => r.data.members),
    enabled: !!pid,
  })

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue)
  }

  useEffect(() => {
    const issueId = Number(searchParams.get('issue'))
    if (!issueId || issues.length === 0) return
    const found = issues.find((i) => i.issue_id === issueId)
    if (found) {
      setSelectedIssue(found)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, issues, setSearchParams])

  const boardSprints = [...sprints].sort((a, b) => {
    const rank = { active: 0, planned: 1, completed: 2 }
    return rank[a.sprint_status] - rank[b.sprint_status]
  })

  if (isLoading || sprintsLoading) return <div>{t('board.loading')}</div>
  if (isError) return <div className="p-6 text-red-500">{t('board.loadFailed')}</div>

  return (
    <>
      <div className="px-3 sm:px-4 py-3 border-b border-white/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-semibold text-jira-text shrink-0">{t('board.title')}</h2>
            <div className="relative min-w-0 flex-1 sm:flex-none sm:w-max max-w-full">
              <select
                className={selectClass}
                value={String(boardScope)}
                onChange={(e) => {
                  const v = e.target.value
                  setPickedScope(v === 'all' ? 'all' : Number(v))
                }}
              >
                <option value="all">{t('board.allIssues')}</option>
                {boardSprints.map((s) => (
                  <option key={s.sprint_id} value={s.sprint_id}>
                    {s.sprint_name} ({t(`sprintStatus.${s.sprint_status}`)})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/70"
              />
            </div>
          </div>
          <p className="text-xs text-jira-text-subtle mt-0.5">
            {selectedSprint
              ? formatSprintDateRange(selectedSprint.start_date, selectedSprint.end_date) ??
              selectedSprint.sprint_status
              : t('board.showingAll')}
          </p>
        </div>
        <Button size="sm" variant="secondary" className="shrink-0 self-start sm:self-auto" onClick={() => {
          setParentIssueForCreate(null)
          setShowCreate(true)
        }}> <Plus size={16} /> {t('backlog.createIssue')}</Button>
      </div>

      <IssueFilterBar
        filters={filters}
        onChange={setFilters}
        members={members}
        epics={epics}
        totalCount={issues.length}
        filteredCount={filteredBoardIssues.length}
      />

      <KanbanBoard
        projectId={pid}
        issues={filteredBoardIssues}
        onIssueClick={handleIssueClick}
        listQueryKey={
          boardScope === 'all' ? issueListKey.all(pid) : issueListKey.sprint(pid, boardScope)
        }
      />

      <CreateIssueModal
        open={showCreate}
        onClose={() => {
          setShowCreate(false)
          setParentIssueForCreate(null)
        }}
        projectId={pid}
        canCreateBug={canCreateBug}
        parentIssue={parentIssueForCreate}
      />

      <IssueDetailPanel
        projectId={pid}
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onDeleted={() => setSelectedIssue(null)}
        onAddSubtask={(parent) => {
          setParentIssueForCreate(parent)
          setSelectedIssue(null)
          setShowCreate(true)
        }}
      />
    </>
  )
}