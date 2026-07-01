import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { FolderKanban } from 'lucide-react'
import { getApiErrorMessage } from '../utils/apiError'
import { useGoogleLogin } from '../hooks/useGoogleLogin'

export function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirect = searchParams.get('redirect') || '/projects'
    const setAuth = useAuthStore((s) => s.setAuth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const mutation = useMutation({
        mutationFn: (data: { email: string; password: string }) =>
            authApi.login(data.email, data.password),
        onSuccess: (res) => {
            const { safeUser, accessToken, refreshToken } = res.data.data
            setAuth(safeUser, accessToken, refreshToken)
            navigate(redirect)
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, 'Login failed'))
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
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
                    <h1 className="text-xl font-semibold text-jira-text">Sign in to your account</h1>
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

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Signing in...' : 'Sign in'}
                    </Button>

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
                            {getApiErrorMessage(googleLogin.error, 'Google login failed')}
                        </p>
                    )}


                    <p className="text-center text-sm text-jira-text-subtle">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-jira-blue hover:underline">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
