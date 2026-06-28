import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { issueApi } from '../api/issue.api'
import { KanbanBoard } from '../components/board/KanbanBoard'
import { CreateIssueModal } from '../components/issue/CreateIssueModal'
import { IssueDetailPanel } from '../components/issue/IssueDetailPanel'
import { Button } from '../components/ui/Button'
import type { Issue } from '../types/issue.types'

export function BoardPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['issues', pid],
    queryFn: () => issueApi.getByProject(pid).then((r) => r.data.result),
    enabled: !!pid,
  })

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue)
  }

  if (isLoading) return <div className="p-6 text-jira-text-subtle">Loading board...</div>
  if (isError) return <div className="p-6 text-red-500">Failed to load issues.</div>

  return (
    <>
      <div className="px-4 py-3 bg-white border-b border-jira-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-jira-text">Board</h2>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Create issue</Button>
      </div>

      <KanbanBoard
        projectId={pid}
        issues={issues}
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