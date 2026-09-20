import type { ActivityLog } from '../types/activityLog.types'
import { t } from '../i18n/useT'

export function formatActivityMessage(activity: ActivityLog): string {
  const name = activity.user?.user_name || t('activity.someone')
  const issueName = activity.issue?.issue_name || t('activity.anIssue')
  const sprintName = activity.sprint?.sprint_name || t('activity.aSprint')

  switch (activity.action_type) {
    case 'ISSUE_CREATED':
      return t('activity.issueCreated', { name, issue: issueName })
    case 'ISSUE_UPDATED':
      return t('activity.issueUpdated', { name, issue: issueName })
    case 'ISSUE_DELETED':
      return t('activity.issueDeleted', { name })
    case 'STATUS_CHANGED':
      return t('activity.statusChanged', { name, issue: issueName, value: activity.new_value ?? '' })
    case 'PRIORITY_CHANGED':
      return t('activity.priorityChanged', { name, issue: issueName, value: activity.new_value ?? '' })
    case 'ISSUE_ASSIGNED':
      return t('activity.issueAssigned', { name, issue: issueName })
    case 'ISSUE_MOVED_TO_SPRINT':
      return t('activity.movedToSprint', { name, issue: issueName, sprint: sprintName })
    case 'COMMENT_ADDED':
      return t('activity.commentAdded', { name, issue: issueName })
    case 'COMMENT_UPDATED':
      return t('activity.commentUpdated', { name, issue: issueName })
    case 'COMMENT_DELETED':
      return t('activity.commentDeleted', { name, issue: issueName })
    case 'SPRINT_CREATED':
      return t('activity.sprintCreated', { name, sprint: sprintName })
    case 'SPRINT_UPDATED':
      return t('activity.sprintUpdated', { name, sprint: sprintName })
    case 'SPRINT_STARTED':
      return t('activity.sprintStarted', { name, sprint: sprintName })
    case 'SPRINT_COMPLETED':
      return t('activity.sprintCompleted', { name, sprint: sprintName })
    case 'MEMBER_INVITED':
      return t('activity.memberInvited', { name })
    case 'INVITATION_ACCEPTED':
      return t('activity.invitationAccepted', { name })
    case 'INVITATION_DECLINED':
      return t('activity.invitationDeclined', { name })
    case 'MEMBER_REMOVED':
      return t('activity.memberRemoved', { name })
    default:
      return t('activity.fallback', {
        name,
        action: activity.action_type.replace(/_/g, ' ').toLowerCase(),
      })
  }
}
