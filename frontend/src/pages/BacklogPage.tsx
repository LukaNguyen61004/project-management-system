import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import type { Issue } from '../types/issue.types'
import type { Sprint } from '../types/sprint.types'
import { issueApi } from '../api/issue.api'
import { sprintApi } from '../api/sprint.api'
import { BacklogList } from '../components/backlog/BacklogList'
import { CreateIssueModal } from '../components/issue/CreateIssueModal'
import { IssueDetailPanel } from '../components/issue/IssueDetailPanel'
import { CreateSprintModal } from '../components/sprint/CreateSprintModal'
import { EditSprintModal } from '../components/sprint/EditSprintModal'
import { Button } from '../components/ui/Button'

export function BacklogPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)
  const [showCreateIssue, setShowCreateIssue] = useState(false)
  const [showCreateSprint, setShowCreateSprint] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)

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
          <Button size="sm" variant="secondary" onClick={() => setShowCreateSprint(true)}>
            <Plus size={14} /> Create sprint
          </Button>
          <Button size="sm" onClick={() => setShowCreateIssue(true)}>
            <Plus size={14} /> Create issue
          </Button>
        </div>
      </div>

      <BacklogList
        projectId={pid}
        issues={issues}
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
    </>
  )
}
