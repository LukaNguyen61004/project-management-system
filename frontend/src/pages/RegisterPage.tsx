import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { FolderKanban } from 'lucide-react'
import { getApiErrorMessage } from '../utils/apiError'
import { useGoogleLogin } from '../hooks/useGoogleLogin'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.register(data.email, data.password),
    onSuccess: () => navigate('/login'),
    onError: (err) => {
      setError(getApiErrorMessage(err, 'Registration failed'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    mutation.mutate({ email, password })
  }

  const googleLogin = useGoogleLogin()

  return (
    <div className="min-h-screen flex items-center justify-center bg-jira-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-jira-blue mb-4">
            <FolderKanban size={32} />
            <span className="text-2xl font-bold">PMS</span>
          </div>
          <h1 className="text-xl font-semibold text-jira-text">Create your account</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-jira-border p-6 space-y-4 shadow-sm"
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating account...' : 'Register'}
          </Button>

          <p className="text-center text-sm text-jira-text-subtle">
            Already have an account?{' '}
            <Link to="/login" className="text-jira-blue hover:underline">
              Sign in
            </Link>
          </p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-jira-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-jira-text-subtle">or</span>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={googleLogin.isPending}
            onClick={() => googleLogin.mutate()}
          >
            {googleLogin.isPending ? 'Signing in...' : 'Continue with Google'}
          </Button>
          {googleLogin.error && (
            <p className="text-sm text-red-500 text-center">
              {(googleLogin.error as { response?: { data?: { error?: string } } }).response
                ?.data?.error || 'Google login failed'}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
