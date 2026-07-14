import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../../store/auth.store'
import { authApi } from '../../api/auth.api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Khôi phục session sau F5:
 * - Access token mất (chỉ ở memory)
 * - Gọi refresh bằng httpOnly cookie → lấy access mới → /auth/me
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function restore() {
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )
        const accessToken = data.data.accessToken as string
        useAuthStore.setState({ accessToken, isAuthenticated: true })

        const me = await authApi.getMe()
        if (!cancelled) {
          useAuthStore.setState({
            user: me.data.data,
            accessToken,
            isAuthenticated: true,
          })
        }
      } catch {
        if (!cancelled) {
          useAuthStore.getState().logout()
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jira-bg text-jira-text-subtle text-sm">
        Loading...
      </div>
    )
  }

  return <>{children}</>
}
