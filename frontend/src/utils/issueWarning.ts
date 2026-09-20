import { formatDistanceToNow } from 'date-fns'
import type { Issue } from '../types/issue.types'
import { t } from '../i18n/useT'
import { getDateFnsLocale } from '../i18n/dateLocale'

export function isIssueWarned(issue: Issue): boolean {
    return issue.warning_count > 0;
}

export function getWarningLabel(issue: Issue): string {
    if (!isIssueWarned(issue)) return '';
    const inactive = formatDistanceToNow(new Date(issue.last_activity_at), {
        addSuffix: true,
        locale: getDateFnsLocale(),
    })
    const times =
        issue.warning_count === 1
            ? t('warning.once')
            : t('warning.many', { count: issue.warning_count })
    return t('warning.label', { inactive, times })
}
