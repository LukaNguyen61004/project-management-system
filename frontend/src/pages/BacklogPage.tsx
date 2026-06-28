import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { issueApi } from '../api/issue.api'
import { BacklogList } from '../components/backlog/BacklogList'
import { CreateIssueModal } from '../components/issue/CreateIssueModal'
import { IssueDetailPanel } from '../components/issue/IssueDetailPanel'
import { Button } from '../components/ui/Button'
import type { Issue } from '../types/issue.types'

export function BacklogPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ['issues', pid],
    queryFn: () => issueApi.getByProject(pid).then((r) => r.data.result),
    enabled: !!pid,
  })

  if (isLoading) return <div className="p-6 text-jira-text-subtle">Loading backlog...</div>
  if (isError) return <div className="p-6 text-red-500">Failed to load issues.</div>

  return (
    <>
      <div className="px-4 py-3 bg-white border-b border-jira-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-jira-text">Backlog</h2>
          <p className="text-xs text-jira-text-subtle">{issues.length} issues</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Create issue</Button>
      </div>

      <div className="p-4">
        <BacklogList issues={issues} onIssueClick={setSelectedIssue} />
      </div>

      <CreateIssueModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={pid}
      />

      <IssueDetailPanel
        issue={selectedIssue}
         projectId={pid}
        onClose={() => setSelectedIssue(null)}
        onDeleted={() => setSelectedIssue(null)}
      />
    </>
  )
}
