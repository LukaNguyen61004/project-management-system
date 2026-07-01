import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth.store'
import { authApi } from '../../api/auth.api'

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

  const initials =
    user?.user_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-jira-blue flex items-center justify-center text-white text-xs font-medium">
        {user?.user_avatar_url ? (
          <img
            src={user.user_avatar_url}
            alt={user.user_name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <span className="text-sm text-jira-text hidden sm:block max-w-[160px] truncate">
        {user?.user_name || user?.user_email}
      </span>
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
