import { useAuthStore } from '../store/auth.store'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export function ProjectsPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-jira-bg p-8">
      <div className="max-w-2xl mx-auto bg-white border border-jira-border rounded-lg p-6">
        <h1 className="text-xl font-semibold text-jira-text">Projects</h1>
        <p className="text-jira-text-subtle mt-2">
          Xin chào, {user?.user_name || user?.user_email}
        </p>
        <p className="text-sm text-jira-text-subtle mt-4">
          Bước 8 sẽ làm danh sách project thật ở đây.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  )
}