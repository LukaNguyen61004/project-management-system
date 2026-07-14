import { signInWithPopup } from 'firebase/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { auth, googleProvider } from '../lib/firebase'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { getPostLoginPath } from '../utils/getPostLoginPath'

export function useGoogleLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const setAuthGoogle = useAuthStore((s) => s.setAuthGoogle)

  return useMutation({
    mutationFn: async () => {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      return authApi.googleLogin(idToken)
    },
    onSuccess: (res) => {
      const { safeUser, accessToken } = res.data.data
      setAuthGoogle(safeUser, accessToken)
      queryClient.clear()
      navigate(getPostLoginPath(searchParams.get('redirect')), { replace: true })
    },
  })
}
