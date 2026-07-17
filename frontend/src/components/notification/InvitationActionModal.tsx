import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '../../types/notification.types'
import { projectApi } from '../../api/project.api'
import { notificationApi } from '../../api/notification.api'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { getApiErrorMessage } from '../../utils/apiError'
import { toast } from 'sonner'

interface InvitationActionModalProps {
  notification: Notification | null
  onClose: () => void
}

export function InvitationActionModal({ notification, onClose }: InvitationActionModalProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const projectId = notification?.related_project_id

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: () => projectApi.getPendingInvitations().then((r) => r.data.data),
    enabled: !!notification && notification.notifi_type === 'project_invitation',
  })

  const invitation = pending.find((inv) => inv.project_id === projectId)

  const markRead = () => {
    if (notification && !notification.is_read) {
      notificationApi.markAsRead(notification.notifi_id)
    }
  }

  const acceptMutation = useMutation({
    mutationFn: () => projectApi.acceptInvitation(invitation!.token),
    onSuccess: (res) => {
      toast.success('Đã chấp nhận lời mời')
      markRead()
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
      onClose()
      const pid = res.data.project?.project_id ?? projectId
      if (pid) navigate(`/projects/${pid}/board`)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Chấp nhận lời mời thất bại')),
  })

  const declineMutation = useMutation({
    mutationFn: () => projectApi.declineInvitation(invitation!.token),
    onSuccess: () => {
      toast.success('Đã từ chối lời mời')
      markRead()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
      onClose()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Từ chối lời mời thất bại')),
  })

  const error = acceptMutation.error || declineMutation.error

  return (
    <Modal open={!!notification} onClose={onClose} title="Project invitation">
      {isLoading ? (
        <p className="text-sm text-jira-text-subtle">Loading...</p>
      ) : !invitation ? (
        <p className="text-sm text-jira-text-subtle">
          This invitation is no longer available (expired or already handled).
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-jira-text">
            You were invited to join{' '}
            <strong>{invitation.project.project_name}</strong> (
            {invitation.project.project_key}).
          </p>
          {error && (
            <p className="text-sm text-red-500">
              {getApiErrorMessage(error, 'Action failed')}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={declineMutation.isPending || acceptMutation.isPending}
              onClick={() => declineMutation.mutate()}
            >
              Decline
            </Button>
            <Button
              disabled={acceptMutation.isPending || declineMutation.isPending}
              onClick={() => acceptMutation.mutate()}
            >
              Accept
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}