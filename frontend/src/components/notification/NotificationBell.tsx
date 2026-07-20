import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { notificationApi } from '../../api/notification.api'
import { NotificationDropdown } from './NotificationDropdown'
import type { Notification } from '../../types/notification.types'
import { InvitationActionModal } from './InvitationActionModal'
import { useNavigate } from 'react-router-dom'

export function NotificationBell() {
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
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
        if (notification.notifi_type === 'stale_issue_warning') {
            setOpen(false)
            if (!notification.is_read) {
                markReadMutation.mutate(notification.notifi_id)
            }
            const pid = notification.related_project_id
            const iid = notification.related_issue_id
            if (pid && iid) {
                navigate(`/projects/${pid}/backlog?issue=${iid}`)
            }
            return
        }

        const isMemberJoined =
            notification.notifi_type === 'project_member_joined' ||
            (notification.notifi_type === 'project_invitation' &&
                notification.notifi_title === 'New member joined')

        if (isMemberJoined) {
            setOpen(false)
            if (!notification.is_read) markReadMutation.mutate(notification.notifi_id)
            return
        }

        if (notification.notifi_type === 'project_invitation') {
            setOpen(false)
            
            if (!notification.is_read) {
                markReadMutation.mutate(notification.notifi_id)
            }

            setInvitationNotification(notification)
            return
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