import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { projectApi } from '../api/project.api'
import { Button } from '../components/ui/Button'
import { ProjectCard } from '../components/project/ProjectCard'
import { CreateProjectModal } from '../components/project/CreateProjectModal'
import { AppHeader } from '../components/layout/AppHeader'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../utils/apiError'

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
      toast.success('Đã tham gia project')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Chấp nhận lời mời thất bại')),
  })

  const declineMutation = useMutation({
    mutationFn: (token: string) => projectApi.declineInvitation(token),
    onSuccess: () => {
      toast.success('Đã từ chối lời mời')
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Từ chối lời mời thất bại')),
  })
  return (
    <div className="min-h-screen bg-jira-bg">
      <AppHeader
        title="Your projects"
        subtitle={`Welcome back, ${user?.user_name || user?.user_email}`}
      />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-jira-text-subtle text-sm">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Create project
          </Button>
        </div>

        {pendingInvites.length > 0 && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="mb-2 font-medium text-blue-800">
              Bạn có {pendingInvites.length} lời mời tham gia project
            </p>
            {pendingInvites.map((inv) => (
              <div key={inv.invitation_id} className="flex items-center justify-between py-1">
                <span className="text-sm text-blue-900">{inv.project?.project_name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptMutation.mutate(inv.token)}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => declineMutation.mutate(inv.token)}
                    className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <PageLoader />
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white border border-jira-border rounded-lg">
            <p className="text-jira-text-subtle mb-4">No projects yet. Create your first one!</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              Create project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.project_id} project={project} />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
