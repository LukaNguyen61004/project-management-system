import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { notificationApi } from '../../api/notification.api'
import { NotificationDropdown } from './NotificationDropdown'
import type { Notification } from '../../types/notification.types'
import { InvitationActionModal } from './InvitationActionModal'

export function NotificationBell() {
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const [invitationNotification, setInvitationNotification] = useState<Notification | null>(null)

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationApi.getAll().then((r) => r.data.data),
        refetchInterval: 30_000,
    })

    const unreadCount = notifications.filter((n) => !n.is_read).length

    const markReadMutation = useMutation({
        mutationFn: (id: number) => notificationApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const markAllMutation = useMutation({
        mutationFn: () => notificationApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const handleNotificationClick = (notification: Notification) => {
        if (notification.notifi_type === 'project_invitation') {
            setOpen(false)
            setInvitationNotification(notification)
            return
        }
        if (!notification.is_read) {
            markReadMutation.mutate(notification.notifi_id)
        }
    }

    useEffect(() => {
        if (!open) return
        const close = () => setOpen(false)
        document.addEventListener('click', close)
        return () => document.removeEventListener('click', close)
    }, [open])

    return (
        <div className="relative">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setOpen(!open)
                }}
                className="relative p-2 rounded hover:bg-gray-100 text-jira-text-subtle hover:text-jira-text"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-medium bg-red-500 text-white rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <NotificationDropdown
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllRead={() => markAllMutation.mutate()}
                    isMarkingAll={markAllMutation.isPending}
                />
            )}

            <InvitationActionModal
                notification={invitationNotification}
                onClose={() => setInvitationNotification(null)}
            />
        </div>
    )
}