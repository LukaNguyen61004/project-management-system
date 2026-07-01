import { signInWithPopup } from 'firebase/auth'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { auth, googleProvider } from '../lib/firebase'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import type { User } from '../types/auth.types'
import { getPostLoginPath } from '../utils/getPostLoginPath'

function toSafeUser(raw: Record<string, unknown>): User {
  return {
    user_id: raw.user_id as number,
    user_email: raw.user_email as string,
    user_name: (raw.user_name as string | null) ?? null,
    user_avatar_url: (raw.user_avatar_url as string | null) ?? null,
    provider: raw.provider as User['provider'],
    user_created_at: String(raw.user_created_at),
    user_updated_at: String(raw.user_updated_at),
  }
}

export function useGoogleLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAuthGoogle = useAuthStore((s) => s.setAuthGoogle)

  return useMutation({
    mutationFn: async () => {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      return authApi.googleLogin(idToken)
    },
    onSuccess: (res) => {
      const payload = res.data.user
      const safeUser = toSafeUser(payload.user as unknown as Record<string, unknown>)
      setAuthGoogle(safeUser, payload.accessToken)
      navigate(getPostLoginPath(searchParams.get('redirect')))
    },
  })
}
