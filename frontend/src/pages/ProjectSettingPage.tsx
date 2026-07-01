import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../api/project.api'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../utils/apiError'
import { Mail, UserMinus } from 'lucide-react'
import { ActivityLogList } from '../components/activityLog/ActivityLogList'

export function ProjectSettingPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', pid],
    queryFn: () => projectApi.getById(pid).then((r) => r.data.project),
    enabled: !!pid,
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members', pid],
    queryFn: () => projectApi.getMembers(pid).then((r) => r.data.members),
    enabled: !!pid,
  })

  useEffect(() => {
    if (project) {
      setName(project.project_name)
      setDescription(project.project_description || '')
    }
  }, [project])

  const updateMutation = useMutation({
    mutationFn: () =>
      projectApi.update(pid, {
        project_name: name,
        project_description: description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', pid] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const inviteMutation = useMutation({
    mutationFn: () => projectApi.invite(pid, inviteEmail),
    onSuccess: () => {
      setInviteEmail('')
    }
  })

  const removeMutation = useMutation({
    mutationFn: (userId: number) => projectApi.removeMember(pid, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', pid] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.length < 3) return
    updateMutation.mutate()
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    inviteMutation.mutate()
  }

  if (isLoading) return <div className="p-6 text-jira-text-subtle">Loading settings...</div>
  if (isError) return <div className="p-6 text-red-500">Failed to load project.</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-lg font-semibold text-jira-text mb-6">Project settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 bg-white rounded-lg border border-jira-border p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-jira-text">Project info</h3>
          <div>
            <label className="text-sm font-medium text-jira-text">Project key</label>
            <p className="mt-1 text-sm text-jira-text-subtle">{project?.project_key}</p>
            <p className="text-xs text-jira-text-subtle mt-0.5">Key cannot be changed</p>
          </div>

          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
          />

          <div>
            <label className="text-sm font-medium text-jira-text">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue"
              placeholder="Optional description..."
            />
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-red-500">
              {getApiErrorMessage(updateMutation.error, 'Failed to update project')}
            </p>
          )}

          {updateMutation.isSuccess && (
            <p className="text-sm text-green-600">Project updated successfully.</p>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={updateMutation.isPending || name.length < 3}>
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>


        <section className="lg:col-span-6 bg-white rounded-lg border border-jira-border p-6">
          <h3 className="text-base font-semibold text-jira-text mb-4">Team members</h3>
          <form onSubmit={handleInviteSubmit} className="flex gap-2 mb-4">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email to invite..."
              className="flex-1"
              required
            />
            <Button type="submit" disabled={inviteMutation.isPending}>
              <Mail size={16} />
              {inviteMutation.isPending ? 'Sending...' : 'Invite'}
            </Button>
          </form>
          {inviteMutation.isError && (
            <p className="text-sm text-red-500 mb-4">
              {getApiErrorMessage(inviteMutation.error, 'Failed to send invitation')}
            </p>
          )}
          {inviteMutation.isSuccess && (
            <p className="text-sm text-green-600 mb-4">
              Invitation sent. User must accept before appearing in the list.
            </p>
          )}
          <div className="divide-y divide-jira-border">
            {members.length === 0 ? (
              <p className="text-sm text-jira-text-subtle py-4 text-center">No members yet</p>
            ) : (
              members.map((member) => (
                <div
                  key={member.pm_id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-jira-text">
                      {member.user.user_name || member.user.user_email}
                    </p>
                    <p className="text-xs text-jira-text-subtle">{member.user.user_email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                      {member.role}
                    </span>
                    {member.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => removeMutation.mutate(member.user_id)}
                        disabled={removeMutation.isPending}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        title="Remove member"
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <section className="mt-6 bg-white rounded-lg border border-jira-border p-6">
        <h3 className="text-base font-semibold text-jira-text mb-4">Activity</h3>
        <ActivityLogList projectId={pid} />
      </section>
    </div>
  )
}
