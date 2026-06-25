import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { projectApi } from '../api/project.api'
import { Button } from '../components/ui/Button'
import { ProjectCard } from '../components/project/ProjectCard'
import { CreateProjectModal } from '../components/project/CreateProjectModal'
import { AppHeader } from '../components/layout/AppHeader'

function PageLoader() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-3 border-jira-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function ProjectsPage() {
  const user = useAuthStore((s) => s.user)
  const [showCreate, setShowCreate] = useState(false)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getAll().then((res) => res.data.projects),
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
