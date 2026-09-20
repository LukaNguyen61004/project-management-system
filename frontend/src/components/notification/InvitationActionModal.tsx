import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '../../types/notification.types'
import { projectApi } from '../../api/project.api'
import { notificationApi } from '../../api/notification.api'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { getApiErrorMessage } from '../../utils/apiError'
import { toast } from 'sonner'
import { useT } from '../../i18n/useT'

interface InvitationActionModalProps {
  notification: Notification | null
  onClose: () => void
}

export function InvitationActionModal({ notification, onClose }: InvitationActionModalProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const t = useT()
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
      toast.success(t('project.joined'))
      markRead()
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
      onClose()
      const pid = res.data.project?.project_id ?? projectId
      if (pid) navigate(`/projects/${pid}/board`)
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('project.acceptFailed'))),
  })

  const declineMutation = useMutation({
    mutationFn: () => projectApi.declineInvitation(invitation!.token),
    onSuccess: () => {
      toast.success(t('project.declined'))
      markRead()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
      onClose()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('project.declineFailed'))),
  })

  const error = acceptMutation.error || declineMutation.error

  return (
    <Modal open={!!notification} onClose={onClose} title={t('invite.title')}>
      {isLoading ? (
        <p className="text-sm text-jira-text-subtle">{t('common.loading')}</p>
      ) : !invitation ? (
        <p className="text-sm text-jira-text-subtle">
          {t('invite.unavailable')}
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-jira-text">
            {t('invite.joinHint', {
              name: invitation.project.project_name,
              key: invitation.project.project_key,
            })}
          </p>
          {error && (
            <p className="text-sm text-red-500">
              {getApiErrorMessage(error, t('invite.actionFailed'))}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={declineMutation.isPending || acceptMutation.isPending}
              onClick={() => declineMutation.mutate()}
            >
              {t('invite.decline')}
            </Button>
            <Button
              disabled={acceptMutation.isPending || declineMutation.isPending}
              onClick={() => acceptMutation.mutate()}
            >
              {t('project.accept')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}