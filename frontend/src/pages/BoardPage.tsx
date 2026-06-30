import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { issueApi } from '../api/issue.api'
import { sprintApi } from '../api/sprint.api'
import { KanbanBoard } from '../components/board/KanbanBoard'
import { CreateIssueModal } from '../components/issue/CreateIssueModal'
import { IssueDetailPanel } from '../components/issue/IssueDetailPanel'
import { Button } from '../components/ui/Button'
import type { Issue } from '../types/issue.types'
import { formatSprintDateRange } from '../utils/date'

export function BoardPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
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


  const activeSprint = sprints.find((s) => s.sprint_status === 'active')

  const boardIssues = activeSprint ? issues.filter((i) => i.sprint_id === activeSprint.sprint_id) : issues

  const dateRange = activeSprint ? formatSprintDateRange(activeSprint.start_date, activeSprint.end_date) : null

  if (isLoading || sprintsLoading) return <div>Loading board...</div>
  if (isError) return <div className="p-6 text-red-500">Failed to load issues.</div>

  return (
    <>
      <div className="px-4 py-3 bg-white border-b border-jira-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-jira-text">
            {activeSprint ? activeSprint.sprint_name : 'All issues'}
          </h2>
          <p className="text-xs text-jira-text-subtle">
            {activeSprint
              ? dateRange ?? 'Active sprint'
              : 'No active sprint — showing all project issues'}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Create issue</Button>
      </div>

      <KanbanBoard
        projectId={pid}
        issues={boardIssues}
        onIssueClick={handleIssueClick}
      />

      <CreateIssueModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={pid}
      />

      <IssueDetailPanel
        projectId={pid}
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onDeleted={() => setSelectedIssue(null)}
      />
    </>
  )
}