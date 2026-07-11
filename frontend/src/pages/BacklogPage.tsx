import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import type { Issue } from '../types/issue.types'
import type { Sprint } from '../types/sprint.types'
import { issueApi } from '../api/issue.api'
import { sprintApi } from '../api/sprint.api'
import { epicApi } from '../api/epic.api'
import { BacklogList } from '../components/backlog/BacklogList'
import { CreateIssueModal } from '../components/issue/CreateIssueModal'
import { IssueDetailPanel } from '../components/issue/IssueDetailPanel'
import { CreateSprintModal } from '../components/sprint/CreateSprintModal'
import { EditSprintModal } from '../components/sprint/EditSprintModal'
import { Button } from '../components/ui/Button'
import { CreateEpicModal } from '../components/epic/CreateEpicModal'
import { EMPTY_ISSUE_FILTERS } from '../types/issueFilter.types'
import { projectApi } from '../api/project.api'
import { useIssueFilters } from '../hooks/useIssueFilters'
import { IssueFilterBar } from '../components/issue/IssueFilterBar'

export function BacklogPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)
  const [showCreateIssue, setShowCreateIssue] = useState(false)
  const [showCreateSprint, setShowCreateSprint] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [showCreateEpic, setShowCreateEpic] = useState(false)
  const [filters, setFilters] = useState(EMPTY_ISSUE_FILTERS)

  const [searchParams, setSearchParams] = useSearchParams()

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['issues', pid],
    queryFn: () => issueApi.getByProject(pid).then((r) => r.data.result),
    enabled: !!pid,
  })

  const { data: sprints = [], isLoading: sprintsLoading } = useQuery({
    queryKey: ['sprints', pid],
    queryFn: () => sprintApi.getByProject(pid).then((r) => r.data.data),
    enabled: !!pid,
  })

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

  const filteredIssues = useIssueFilters(issues, filters)

  useEffect(() => {
    const issueId = Number(searchParams.get('issue'))
    if (!issueId || issues.length === 0) return
    const found = issues.find((i) => i.issue_id === issueId)
    if (found) {
      setSelectedIssue(found)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, issues, setSearchParams])

  if (isLoading || sprintsLoading) {
    return <div className="p-6 text-jira-text-subtle">Loading backlog...</div>
  }
  if (isError) return <div className="p-6 text-red-500">Failed to load issues.</div>

  return (
    <>
      <div className="px-4 py-3 bg-white border-b border-jira-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-jira-text">Backlog & Sprints</h2>
          <p className="text-xs text-jira-text-subtle">{issues.length} issues</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowCreateEpic(true)}>
            <Plus size={14} /> Create epic
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowCreateSprint(true)}>
            <Plus size={14} /> Create sprint
          </Button>
          <Button size="sm" onClick={() => setShowCreateIssue(true)}>
            <Plus size={14} /> Create issue
          </Button>
        </div>
      </div>

      {epics.length > 0 && (
        <div className="px-4 py-3 bg-white border-b border-jira-border flex flex-wrap gap-2">
          {epics.map((e) => (
            <span
              key={e.epic_id}
              className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-jira-border"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: e.epic_color }}
              />
              {e.epic_name}
              <span className="text-jira-text-subtle">
                ({e._count?.issues ?? 0})
              </span>
            </span>
          ))}
        </div>
      )}

      <IssueFilterBar
        filters={filters}
        onChange={setFilters}
        members={members}
        epics={epics}
        totalCount={issues.length}
        filteredCount={filteredIssues.length}
      />



      <BacklogList
        projectId={pid}
        issues={filteredIssues}
        sprints={sprints}
        onIssueClick={setSelectedIssue}
        onEditSprint={setEditingSprint}
      />

      <CreateIssueModal
        open={showCreateIssue}
        onClose={() => setShowCreateIssue(false)}
        projectId={pid}
      />

      <IssueDetailPanel
        issue={selectedIssue}
        projectId={pid}
        onClose={() => setSelectedIssue(null)}
        onDeleted={() => setSelectedIssue(null)}
      />

      <CreateSprintModal
        open={showCreateSprint}
        projectId={pid}
        onClose={() => setShowCreateSprint(false)}
      />

      <EditSprintModal
        open={!!editingSprint}
        sprint={editingSprint}
        projectId={pid}
        onClose={() => setEditingSprint(null)}
      />

      <CreateEpicModal
        open={showCreateEpic}
        projectId={pid}
        onClose={() => setShowCreateEpic(false)}
      />
    </>
  )
}
