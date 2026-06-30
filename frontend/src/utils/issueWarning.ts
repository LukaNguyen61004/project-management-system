import { formatDistanceToNow } from 'date-fns'
import type { Issue } from '../types/issue.types'

export function isIssueWarned(issue: Issue): boolean {
    return issue.warning_count > 0;
}

export function getWarningLabel(issue: Issue): string {
    if (!isIssueWarned(issue)) return '';
    const inactive = formatDistanceToNow(new Date(issue.last_activity_at), {
        addSuffix: true,
    })
    const times =
        issue.warning_count === 1
            ? '1 time'
            : `${issue.warning_count} times`
    return `No activity ${inactive} · Warned ${times}`
}