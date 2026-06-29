import { formatDistanceToNow } from 'date-fns'
import type { Notification } from '../../types/notification.types'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../utils/cn'

interface NotificationItemProps {
  notification: Notification
  onClick: (notification: Notification) => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-jira-border hover:bg-jira-bg transition-colors',
        !notification.is_read && 'bg-blue-50'
      )}
    >
      <div className="flex gap-3">
        <Avatar
          name={notification.sender?.user_name}
          src={notification.sender?.user_avatar_url}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-jira-text truncate">
              {notification.notifi_title}
            </p>
            <span className="text-xs text-jira-text-subtle shrink-0">
              {formatDistanceToNow(new Date(notification.notifi_created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-xs text-jira-text-subtle mt-1 line-clamp-2">
            {notification.notifi_content}
          </p>
        </div>
      </div>
    </button>
  )
}