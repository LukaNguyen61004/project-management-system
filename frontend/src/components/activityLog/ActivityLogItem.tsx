import { formatDistanceToNow } from 'date-fns'
import type { ActivityLog } from '../../types/activityLog.types'
import { formatActivityMessage } from '../../utils/formatActivityMessage'
import { Avatar } from '../ui/Avatar'

interface ActivityLogItemProps {
  activity: ActivityLog
}

export function ActivityLogItem({ activity }: ActivityLogItemProps) {
  return (
    <div className="flex gap-3 py-3">
      <Avatar
        name={activity.user?.user_name}
        src={activity.user?.user_avatar_url}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-jira-text">{formatActivityMessage(activity)}</p>
        <p className="text-xs text-jira-text-subtle mt-0.5">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}