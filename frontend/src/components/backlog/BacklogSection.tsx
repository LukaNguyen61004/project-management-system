import type { Issue } from '../../types/issue.types'
import { SprintDropZone } from '../sprint/SprintDropZone'
import { BACKLOG_DROP_ID } from '../sprint/sprintDnd'
import { DraggableBacklogIssueRow } from './DraggableBacklogIssueRow'

interface BacklogSectionProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function BacklogSection({ issues, onIssueClick }: BacklogSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-jira-border">
      <div className="px-4 py-3 border-b border-jira-border">
        <h3 className="text-sm font-semibold text-jira-text">
          Backlog ({issues.length} issues)
        </h3>
      </div>
      <SprintDropZone
        id={BACKLOG_DROP_ID}
        isEmpty={issues.length === 0}
        emptyMessage="Drop issues here"
      >
        <div className="divide-y divide-jira-border">
          {issues.map((issue) => (
            <DraggableBacklogIssueRow
              key={issue.issue_id}
              issue={issue}
              onClick={() => onIssueClick(issue)}
            />
          ))}
        </div>
      </SprintDropZone>
    </div>
  )
}
