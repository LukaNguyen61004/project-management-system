import type { Issue } from '../../types/issue.types'
import type { Sprint } from '../../types/sprint.types'
import { DraggableBacklogIssueRow } from '../backlog/DraggableBacklogIssueRow'
import { SprintPanel } from './SprintPanel'

interface SprintListProps {
  sprints: Sprint[]
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onEditSprint?: (sprint: Sprint) => void
}

export function SprintList({ sprints, issues, onIssueClick, onEditSprint }: SprintListProps) {
  return (
    <>
      {sprints.map((sprint) => {
        const sprintIssues = issues.filter((i) => i.sprint_id === sprint.sprint_id)

        return (
          <SprintPanel
            key={sprint.sprint_id}
            sprint={sprint}
            issueCount={sprintIssues.length}
            onEdit={onEditSprint}
            defaultOpen={sprint.sprint_status === 'active'}
          >
            <div className="divide-y divide-jira-border">
              {sprintIssues.map((issue) => (
                <DraggableBacklogIssueRow
                  key={issue.issue_id}
                  issue={issue}
                  onClick={() => onIssueClick(issue)}
                />
              ))}
            </div>
          </SprintPanel>
        )
      })}
    </>
  )
}
