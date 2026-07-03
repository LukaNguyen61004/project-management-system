import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth.store'
import { authApi } from '../../api/auth.api'
import { Avatar } from '../ui/Avatar'
import { Link } from 'react-router-dom'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // vẫn logout local nếu API lỗi
    }
    logout()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/profile"
        className="flex items-center gap-3 hover:opacity-80 rounded-lg px-1 py-0.5"
        title="Your profile"
      >
        <Avatar
          name={user?.user_name || user?.user_email}
          src={user?.user_avatar_url}
          size="md"
        />
        <span className="text-sm text-jira-text hidden sm:block max-w-[160px] truncate">
          {user?.user_name || user?.user_email}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="p-1.5 rounded hover:bg-gray-100 text-jira-text-subtle"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </div>
  )
}
