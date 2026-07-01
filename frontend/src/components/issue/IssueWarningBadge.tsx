import { AlertTriangle } from 'lucide-react'
import type { Issue } from '../../types/issue.types'
import { getWarningLabel, isIssueWarned } from '../../utils/issueWarning'

export function IssueWarningBadge({ issue }: { issue: Issue }) {
  if (!isIssueWarned(issue)) return null

  return (
    <span
      title={getWarningLabel(issue)}
      className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0"
    >
      <AlertTriangle size={12} />
      {issue.warning_count}
    </span>
  )
}