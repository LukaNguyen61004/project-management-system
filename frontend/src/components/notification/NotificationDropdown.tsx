import type { Notification } from '../../types/notification.types'
import { NotificationItem } from './NotificationItem'

interface NotificationDropdownProps {
  notifications: Notification[]
  onNotificationClick: (notification: Notification) => void
  onMarkAllRead: () => void
  isMarkingAll?: boolean
}

export function NotificationDropdown({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  isMarkingAll,
}: NotificationDropdownProps) {
  const hasUnread = notifications.some((n) => !n.is_read)

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 bg-white border border-jira-border rounded-lg shadow-xl z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-jira-border">
        <span className="text-sm font-semibold text-jira-text">Notifications</span>
        {hasUnread && (
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={isMarkingAll}
            className="text-xs text-jira-blue hover:underline disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-jira-text-subtle text-center py-8">
            No notifications
          </p>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.notifi_id}
              notification={n}
              onClick={onNotificationClick}
            />
          ))
        )}
      </div>
    </div>
  )
}