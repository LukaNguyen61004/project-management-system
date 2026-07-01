import type { Issue } from '../../types/issue.types'
import { Avatar } from '../ui/Avatar'
import { IssueTypeIcon } from '../issue/IssueTypeIcon'
import { IssueWarningBadge } from '../issue/IssueWarningBadge'


interface BacklogIssueRowProps {
  issue: Issue
}

export function BacklogIssueRow({ issue }: BacklogIssueRowProps) {
  return (
    <>
      <IssueTypeIcon type={issue.issue_type} />
      <span className="text-xs text-jira-text-subtle w-20 shrink-0">{issue.issue_key}</span>
      <span className="text-sm text-jira-text flex-1 truncate">{issue.issue_name}</span>
      <IssueWarningBadge issue={issue}/>
      {issue.assignee && (
        <Avatar
          name={issue.assignee.user_name}
          src={issue.assignee.user_avatar_url}
          size="sm"
        />
      )}
    </>
  )
}
