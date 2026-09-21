import type { Notification } from '../types/notification.types'
import { t } from '../i18n/useT'

export function formatNotification(notification: Notification): {
  title: string
  content: string
} {
  const name = notification.sender?.user_name || t('notif.someone')
  const issueId = notification.related_issue_id ?? ''
  const sprintId = notification.related_sprint_id ?? ''

  switch (notification.notifi_type) {
    case 'issue_assigned':
      return {
        title: t('notif.assignedTitle'),
        content: t('notif.assignedContent', { id: issueId }),
      }
    case 'comment_added':
      return {
        title: t('notif.commentTitle'),
        content: t('notif.commentContent', { id: issueId }),
      }
    case 'sprint_started':
      return {
        title: t('notif.sprintStartedTitle'),
        content: t('notif.sprintStartedContent', { id: sprintId }),
      }
    case 'sprint_completed':
      return {
        title: t('notif.sprintCompletedTitle'),
        content: t('notif.sprintCompletedContent', { id: sprintId }),
      }
    case 'project_invitation':
      return {
        title: t('notif.inviteTitle'),
        content: t('notif.inviteContent'),
      }
    case 'project_member_joined':
      return {
        title: t('notif.joinedTitle'),
        content: t('notif.joinedContent', { name }),
      }
    case 'project_invitation_declined':
      return {
        title: t('notif.declinedTitle'),
        content: t('notif.declinedContent', { name }),
      }
    case 'stale_issue_warning':
      return {
        title: t('notif.staleTitle'),
        content: t('notif.staleContent', { id: issueId }),
      }
    default:
      return {
        title: notification.notifi_title,
        content: notification.notifi_content,
      }
  }
}
