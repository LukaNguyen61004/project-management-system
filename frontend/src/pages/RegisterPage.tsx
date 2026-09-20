import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../utils/apiError'
import { useGoogleLogin } from '../hooks/useGoogleLogin'
import { AuthShell } from '../components/auth/AuthShell'
import { useT } from '../i18n/useT'

const authInputClass =
  'h-12 rounded-none bg-transparent border-0 border-b border-white/70 px-0 focus:ring-0 text-white'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const t = useT()

  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.register(data.email, data.password),
    onSuccess: () => navigate('/login', { state: { authSwitch: true } }),
    onError: (err) => {
      setError(getApiErrorMessage(err, t('auth.registerFailed')))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError(t('auth.passwordsMismatch'))
      return
    }
    if (password.length < 8) {
      setError(t('auth.passwordMin'))
      return
    }
    if (!/[A-Za-z]/.test(password)) {
      setError(t('auth.passwordLetter'))
      return
    }
    if (!/[0-9]/.test(password)) {
      setError(t('auth.passwordNumber'))
      return
    }
    mutation.mutate({ email, password })
  }

  const googleLogin = useGoogleLogin()

  return (
    <AuthShell mode="signup">
      <p className="font-[Jua] text-2xl tracking-wide text-white">CINDER</p>
      <h1 className="mt-3 font-[Hind] text-[30px] font-medium leading-tight text-white uppercase">
        {t('auth.signUpTitle')}
      </h1>
      <p className="mt-3 font-[Hind] text-xl text-[rgba(252,252,252,0.48)]">
        {t('auth.signUpHint')}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Input
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className={authInputClass}
        />
        <div>
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className={authInputClass}
          />
          <p className="mt-1 text-xs text-jira-text-subtle">
            {t('auth.passwordHint')}
          </p>
        </div>
        <Input
          label={t('auth.confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          className={authInputClass}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="h-[70px] w-full  h-12  rounded-full border border-white bg-transparent text-white hover:bg-transparent"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('auth.creatingAccount') : t('auth.createAccount')}
          </Button>

          <Button
            type="button"
            className="h-[70px] w-full  h-12  rounded-full border border-white bg-transparent text-white hover:bg-transparent"
            disabled={googleLogin.isPending}
            onClick={() => googleLogin.mutate()}
          >
            {googleLogin.isPending ? t('auth.signingIn') : t('auth.google')}
          </Button>
        </div>
        {googleLogin.error && (
          <p className="text-center text-sm text-red-400">
              {(googleLogin.error as { response?: { data?: { error?: string } } }).response
              ?.data?.error || t('auth.googleFailed')}
          </p>
        )}
      </form>
    </AuthShell>
  )
}
