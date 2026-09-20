import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../api/project.api'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../utils/apiError'
import { toast } from 'sonner'
import { useT } from '../i18n/useT'

export function InviteAcceptPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = searchParams.get('token') || ''
  const [error, setError] = useState('')
  const t = useT()

  const acceptMutation = useMutation({
    mutationFn: () => projectApi.acceptInvitation(token),
    onSuccess: (res) => {
      toast.success(t('project.joined'))
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
      const projectId = res.data.project?.project_id
      if (projectId) {
        navigate(`/projects/${projectId}/board`)
      } else {
        navigate('/projects')
      }
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, t('project.acceptFailed'))
      setError(msg)
      toast.error(msg)
    },
  })

  const declineMutation = useMutation({
    mutationFn: () => projectApi.declineInvitation(token),
    onSuccess: () => {
      toast.success(t('project.declined'))
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
      navigate('/projects')
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, t('project.declineFailed'))
      setError(msg)
      toast.error(msg)
    },
  })

  const busy = acceptMutation.isPending || declineMutation.isPending

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jira-bg">
        <p className="text-jira-text-subtle">{t('invite.invalid')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-jira-bg p-4">
      <div className="cinder-glass rounded-[20px] p-8 max-w-md w-full text-center">
        {acceptMutation.isPending ? (
          <p className="text-jira-text-subtle">{t('invite.accepting')}</p>
        ) : declineMutation.isPending ? (
          <p className="text-jira-text-subtle">{t('invite.declining')}</p>
        ) : acceptMutation.isSuccess ? (
          <p className="text-jira-text">{t('invite.accepted')}</p>
        ) : declineMutation.isSuccess ? (
          <p className="text-jira-text">{t('invite.declined')}</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-jira-text mb-2">
              {t('invite.title')}
            </h1>
            <p className="text-sm text-jira-text-subtle mb-6">
              {t('invite.hint')}
            </p>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => declineMutation.mutate()}
                className="w-full"
              >
                {t('invite.decline')}
              </Button>
              <Button
                disabled={busy}
                onClick={() => acceptMutation.mutate()}
                className="w-full"
              >
                {t('invite.accept')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
