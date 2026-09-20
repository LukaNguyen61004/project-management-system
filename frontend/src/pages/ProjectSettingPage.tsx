import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../api/project.api'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../utils/apiError'
import { toast } from 'sonner'
import { LogOut, Mail, UserMinus } from 'lucide-react'
import { ActivityLogList } from '../components/activityLog/ActivityLogList'
import { useAuthStore } from '../store/auth.store'
import { useT } from '../i18n/useT'

export function ProjectSettingPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((s) => s.user?.user_id)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const t = useT()

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
        project_name: name.trim(),
        project_description: description || undefined,
      }),
    onSuccess: () => {
      toast.success(t('settings.saved'))
      queryClient.invalidateQueries({ queryKey: ['project', pid] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('settings.saveFailed'))),
  })

  const inviteMutation = useMutation({
    mutationFn: () => projectApi.invite(pid, inviteEmail),
    onSuccess: (res) => {
      const inv = res.data.invitation
      if (inv.emailSent) {
        toast.success(t('settings.inviteSentEmail'))
      } else {
        toast.success(t('settings.inviteSentApp'))
        toast.warning(
          inv.emailError
            ? t('settings.inviteEmailFail', { error: inv.emailError })
            : t('settings.inviteEmailResend')
        )
      }
      setInviteEmail('')
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('settings.inviteFailed'))),
  })

  const removeMutation = useMutation({
    mutationFn: (userId: number) => projectApi.removeMember(pid, userId),
    onSuccess: () => {
      toast.success(t('settings.memberRemoved'))
      queryClient.invalidateQueries({ queryKey: ['members', pid] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('settings.removeFailed'))),
  })

  const deleteMutation = useMutation({
    mutationFn: () => projectApi.delete(pid),
    onSuccess: () => {
      toast.success(t('settings.deleted'))
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.removeQueries({ queryKey: ['project', pid] })
      navigate('/projects', { replace: true })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('settings.deleteFailed'))),
  })

  const leaveMutation = useMutation({
    mutationFn: () => projectApi.leave(pid),
    onSuccess: () => {
      toast.success(t('settings.left'))
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.removeQueries({ queryKey: ['project', pid] })
      queryClient.removeQueries({ queryKey: ['members', pid] })
      navigate('/projects', { replace: true })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('settings.leaveFailed'))),
  })

  const isOwner = !!project && currentUserId === project.owner_id

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    let nextNameError = ''
    let nextDescriptionError = ''
    if (trimmedName.length < 3) nextNameError = t('project.nameMin')
    else if (trimmedName.length > 100) nextNameError = t('project.nameMax')
    if (description.length > 1000) nextDescriptionError = t('settings.descriptionMax')
    setNameError(nextNameError)
    setDescriptionError(nextDescriptionError)
    if (nextNameError || nextDescriptionError) return
    updateMutation.mutate()
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    inviteMutation.mutate()
  }

  if (isLoading) return <div className="p-6 text-jira-text-subtle">{t('settings.loading')}</div>
  if (isError) return <div className="p-6 text-red-500">{t('settings.loadFailed')}</div>

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <h2 className="text-lg font-semibold text-jira-text mb-6">{t('settings.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">

        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-4 cinder-glass rounded-[20px] p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-jira-text">{t('settings.info')}</h3>
          <div>
            <label className="text-sm font-medium text-jira-text">{t('project.key')}</label>
            <p className="mt-1 text-sm text-jira-text-subtle">{project?.project_key}</p>
            <p className="text-xs text-jira-text-subtle mt-0.5">{t('settings.keyLocked')}</p>
          </div>

          <Input
            label={t('project.name')}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setNameError('')
            }}
            maxLength={100}
            hint={t('project.nameHint')}
            error={nameError}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-jira-text">{t('project.description')}</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setDescriptionError('')
              }}
              rows={4}
              maxLength={1000}
              className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue ${
                descriptionError ? 'border-red-500' : 'border-jira-border'
              }`}
              placeholder={t('common.optional')}
            />
            <span className="text-xs text-jira-text-subtle">{t('settings.descriptionHint')}</span>
            {descriptionError && <span className="text-xs text-red-500">{descriptionError}</span>}
          </div>

          {updateMutation.isError && (
            <p className="text-sm text-red-500">
              {getApiErrorMessage(updateMutation.error, t('settings.updateFailed'))}
            </p>
          )}

          {updateMutation.isSuccess && (
            <p className="text-sm text-green-600">{t('settings.updated')}</p>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('common.saving') : t('settings.saveChanges')}
            </Button>
          </div>
        </form>


        <section className="lg:col-span-6 cinder-glass rounded-[20px] p-6">
          <h3 className="text-base font-semibold text-jira-text mb-4">{t('settings.team')}</h3>
          <form onSubmit={handleInviteSubmit} className="flex gap-2 mb-4">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t('settings.invitePlaceholder')}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={inviteMutation.isPending}>
              <Mail size={16} />
              {inviteMutation.isPending ? t('settings.sending') : t('settings.invite')}
            </Button>
          </form>
          {inviteMutation.isError && (
            <p className="text-sm text-red-500 mb-4">
              {getApiErrorMessage(inviteMutation.error, t('settings.inviteFailed'))}
            </p>
          )}
          {inviteMutation.isSuccess && (
            <p className="text-sm text-green-600 mb-4">
              {t('settings.inviteSentHint')}
            </p>
          )}
          <div className="divide-y divide-jira-border">
            {members.length === 0 ? (
              <p className="text-sm text-jira-text-subtle py-4 text-center">{t('settings.noMembers')}</p>
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
                      {member.role === 'admin' ? t('role.admin') : t('role.member')}
                    </span>
                    {member.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => removeMutation.mutate(member.user_id)}
                        disabled={removeMutation.isPending}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        title={t('settings.removeMember')}
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
      <section className="mt-6 cinder-glass rounded-[20px] p-6">
        <h3 className="text-base font-semibold text-jira-text mb-4">{t('settings.activity')}</h3>
        <ActivityLogList projectId={pid} />
      </section>

      {!isOwner && (
        <section className="mt-6 cinder-glass rounded-[20px] p-6">
          <h3 className="text-base font-semibold text-jira-text mb-2">{t('settings.leaveTitle')}</h3>
          <p className="text-sm text-jira-text-subtle mb-4">
            {t('settings.leaveHint')}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="text-red-500 border-red-200 hover:bg-red-50"
            disabled={leaveMutation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  t('settings.leaveConfirm', { name: project?.project_name ?? '' })
                )
              ) {
                leaveMutation.mutate()
              }
            }}
          >
            <LogOut size={16} />
            {leaveMutation.isPending ? t('settings.leaving') : t('settings.leave')}
          </Button>
        </section>
      )}

      {isOwner && (
        <section className="mt-6 cinder-glass rounded-[20px] border border-red-400/40 p-6">
          <h3 className="text-base font-semibold text-red-600 mb-2">{t('settings.danger')}</h3>
          <p className="text-sm text-jira-text-subtle mb-4">
            {t('settings.deleteHint')}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="text-red-500 border-red-200 hover:bg-red-50"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (
                window.confirm(
                  t('settings.deleteConfirm', { name: project?.project_name ?? '' })
                )
              ) {
                deleteMutation.mutate()
              }
            }}
          >
            {deleteMutation.isPending ? t('common.deleting') : t('settings.deleteProject')}
          </Button>
        </section>
      )}
    </div>
  )
}
