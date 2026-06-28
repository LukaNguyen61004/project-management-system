import type { Issue } from '../../types/issue.types'
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from '../../utils/constants'
import { cn } from '../../utils/cn'

interface BacklogListProps {
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
}

export function BacklogList({ issues, onIssueClick }: BacklogListProps) {
  if (issues.length === 0) {
    return (
      <p className="text-sm text-jira-text-subtle text-center py-12">
        No issues yet. Create one to get started.
      </p>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-jira-border overflow-hidden">
      <div className="grid grid-cols-[6rem_1fr_8rem_8rem] gap-4 px-4 py-2 bg-jira-bg border-b border-jira-border text-xs font-semibold text-jira-text-subtle uppercase">
        <span>Key</span>
        <span>Summary</span>
        <span>Status</span>
        <span>Priority</span>
      </div>
      <div className="divide-y divide-jira-border">
        {issues.map((issue) => {
          const statusLabel = ISSUE_STATUSES.find((s) => s.value === issue.issue_status)?.label
          const priority = ISSUE_PRIORITIES.find((p) => p.value === issue.issue_priority)

          return (
            <button
              key={issue.issue_id}
              type="button"
              onClick={() => onIssueClick(issue)}
              className="w-full grid grid-cols-[6rem_1fr_8rem_8rem] gap-4 px-4 py-3 text-left hover:bg-jira-bg transition-colors"
            >
              <span className="text-xs text-jira-text-subtle font-medium">{issue.issue_key}</span>
              <span className="text-sm text-jira-text truncate">{issue.issue_name}</span>
              <span className="text-xs text-jira-text">{statusLabel}</span>
              <span className={cn('text-xs font-medium uppercase', priority?.color)}>
                {priority?.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
