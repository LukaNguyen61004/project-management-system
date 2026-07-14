import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/auth.types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string) => void
  setAuthGoogle: (user: User, accessToken: string) => void
  updateUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      setAuthGoogle: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      updateUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'pms-auth',
      // Chỉ persist user để UI đẹp lúc F5; token sống trong memory + cookie
      partialize: (state) => ({ user: state.user }),
    }
  )
)
