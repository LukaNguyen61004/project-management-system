import type { Issue } from '../../types/issue.types'
import type { Sprint } from '../../types/sprint.types'
import { EMPTY_ISSUE_FILTERS, type IssueFilters } from '../../types/issueFilter.types'
import { SprintPanel } from './SprintPanel'

interface SprintListProps {
  projectId: number
  sprints: Sprint[]
  onIssueClick: (issue: Issue) => void
  onEditSprint?: (sprint: Sprint) => void
  filters?: IssueFilters
}

export function SprintList({
  projectId,
  sprints,
  onIssueClick,
  onEditSprint,
  filters = EMPTY_ISSUE_FILTERS,
}: SprintListProps) {
  return (
    <>
      {sprints.map((sprint) => (
        <SprintPanel
          key={sprint.sprint_id}
          projectId={projectId}
          sprint={sprint}
          sprints={sprints}
          onIssueClick={onIssueClick}
          onEdit={onEditSprint}
          defaultOpen={sprint.sprint_status === 'active'}
          filters={filters}
        />
      ))}
    </>
  )
}