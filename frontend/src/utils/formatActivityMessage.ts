import type { ActivityLog } from '../types/activityLog.types'

export function formatActivityMessage(activity: ActivityLog): string {
  const name = activity.user?.user_name || 'Someone'
  const issueName = activity.issue?.issue_name || 'an issue'
  const sprintName = activity.sprint?.sprint_name || 'a sprint'

  switch (activity.action_type) {
    case 'ISSUE_CREATED':
      return `${name} created ${issueName}`
    case 'ISSUE_UPDATED':
      return `${name} updated ${issueName}`
    case 'ISSUE_DELETED':
      return `${name} deleted an issue`
    case 'STATUS_CHANGED':
      return `${name} changed status of ${issueName} to ${activity.new_value}`
    case 'PRIORITY_CHANGED':
      return `${name} changed priority of ${issueName} to ${activity.new_value}`
    case 'ISSUE_ASSIGNED':
      return `${name} assigned ${issueName}`
    case 'ISSUE_MOVED_TO_SPRINT':
      return `${name} moved ${issueName} to ${sprintName}`
    case 'COMMENT_ADDED':
      return `${name} commented on ${issueName}`
    case 'COMMENT_UPDATED':
      return `${name} updated a comment on ${issueName}`
    case 'COMMENT_DELETED':
      return `${name} deleted a comment on ${issueName}`
    case 'SPRINT_CREATED':
      return `${name} created sprint ${sprintName}`
    case 'SPRINT_UPDATED':
      return `${name} updated sprint ${sprintName}`
    case 'SPRINT_STARTED':
      return `${name} started sprint ${sprintName}`
    case 'SPRINT_COMPLETED':
      return `${name} completed sprint ${sprintName}`
    case 'MEMBER_INVITED':
      return `${name} invited a member`
    case 'INVITATION_ACCEPTED':
      return `${name} joined the project`
    case 'MEMBER_REMOVED':
      return `${name} removed a member`
    default:
      return `${name} performed ${activity.action_type.replace(/_/g, ' ').toLowerCase()}`
  }
}