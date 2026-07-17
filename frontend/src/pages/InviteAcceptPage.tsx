import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../api/project.api'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../utils/apiError'
import { toast } from 'sonner'

export function InviteAcceptPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = searchParams.get('token') || ''
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => projectApi.acceptInvitation(token),
    onSuccess: (res) => {
      toast.success('Đã tham gia project')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      const projectId = res.data.project?.project_id
      if (projectId) {
        navigate(`/projects/${projectId}/board`)
      } else {
        navigate('/projects')
      }
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, 'Failed to accept invitation')
      setError(msg)
      toast.error(msg)
    },
  })

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jira-bg">
        <p className="text-jira-text-subtle">Invalid invitation link</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-jira-bg p-4">
      <div className="bg-white rounded-lg border border-jira-border p-8 max-w-md w-full text-center">
        {mutation.isPending ? (
          <p className="text-jira-text-subtle">Accepting invitation...</p>
        ) : mutation.isSuccess ? (
          <p className="text-jira-text">Invitation accepted! Redirecting...</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-jira-text mb-2">
              Project invitation
            </h1>
            <p className="text-sm text-jira-text-subtle mb-6">
              You have been invited to join a project. You must be logged in with
              the invited email address to accept.
            </p>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <Button onClick={() => mutation.mutate()} className="w-full">
              Accept invitation
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
