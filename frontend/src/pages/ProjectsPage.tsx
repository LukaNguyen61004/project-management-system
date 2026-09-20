import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { projectApi } from '../api/project.api'
import { Button } from '../components/ui/Button'
import { ProjectCard } from '../components/project/ProjectCard'
import { CreateProjectModal } from '../components/project/CreateProjectModal'
import { AppHeader } from '../components/layout/AppHeader'
import { CinderBackdrop } from '../components/layout/CinderBackdrop'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../utils/apiError'
import { useT } from '../i18n/useT'

function PageLoader() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-3 border-jira-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function ProjectsPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const t = useT()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getAll().then((res) => res.data.projects),
  })

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: () => projectApi.getPendingInvitations().then((r) => r.data.data),
  })
  const acceptMutation = useMutation({
    mutationFn: (token: string) => projectApi.acceptInvitation(token),
    onSuccess: () => {
      toast.success(t('project.joined'))
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('project.acceptFailed'))),
  })

  const declineMutation = useMutation({
    mutationFn: (token: string) => projectApi.declineInvitation(token),
    onSuccess: () => {
      toast.success(t('project.declined'))
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t('project.declineFailed'))),
  })
  return (
    <div className="relative min-h-screen">
      <CinderBackdrop />
      <div className="relative z-10 p-3 sm:p-6 space-y-4">
        <AppHeader
          title={t('project.yourProjects')}
          subtitle={t('project.welcomeBack', { name: user?.user_name || user?.user_email || '' })}
        />

        <div className="cinder-glass rounded-[24px] sm:rounded-[30px] p-4 sm:p-8 min-h-[70vh]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-[30px] font-bold text-white tracking-wide">{t('project.workspace')}</h2>
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              {t('project.create')}
            </Button>
          </div>

          {pendingInvites.length > 0 && (
            <div className="mb-4 rounded-[20px] border border-white/20 bg-white/5 p-4">
              <p className="mb-2 font-medium text-white">
                {t('project.invites', { count: pendingInvites.length })}
              </p>
              {pendingInvites.map((inv) => (
                <div key={inv.invitation_id} className="flex items-center justify-between gap-2 flex-wrap py-1">
                  <span className="text-sm text-white/80">{inv.project?.project_name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptMutation.mutate(inv.token)}
                      className="rounded bg-[#9d877c] px-3 py-1 text-sm text-[#151414] hover:bg-[#b49a8e]"
                    >
                      {t('project.accept')}
                    </button>
                    <button
                      onClick={() => declineMutation.mutate(inv.token)}
                      className="rounded border border-white/30 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                    >
                      {t('project.decline')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoading ? (
            <PageLoader />
          ) : projects.length === 0 ? (
            <div className="text-center py-16 cinder-glass rounded-[20px]">
              <p className="text-jira-text-subtle mb-4">{t('project.empty')}</p>
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                {t('project.create')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.project_id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
