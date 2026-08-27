import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { getApiErrorMessage } from '../utils/apiError'
import { useGoogleLogin } from '../hooks/useGoogleLogin'
import { getPostLoginPath } from '../utils/getPostLoginPath'
import { AuthShell } from '../components/auth/AuthShell'

const authInputClass =
    'h-12 rounded-none bg-transparent border-0 border-b border-white/70 px-0 focus:ring-0 text-white'

export function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const queryClient = useQueryClient()
    const setAuth = useAuthStore((s) => s.setAuth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const mutation = useMutation({
        mutationFn: (data: { email: string; password: string }) =>
            authApi.login(data.email, data.password),
        onSuccess: (res) => {
            const { safeUser, accessToken } = res.data.data
            setAuth(safeUser, accessToken)
            queryClient.clear()
            navigate(getPostLoginPath(searchParams.get('redirect')), { replace: true })
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
        <AuthShell mode="signin">
            <p className="font-[Jua] text-2xl tracking-wide text-white">CINDER</p>
            <h1 className="mt-3 font-[Hind] text-[30px] font-medium leading-tight text-white uppercase">
                Sign in account
            </h1>
            <p className="mt-3 font-[Hind] text-xl text-[rgba(252,252,252,0.48)]">
                Welcome back !!!
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={authInputClass}
                />
                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={authInputClass}
                />

                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        className="h-[70px] w-full h-12 rounded-full border border-white bg-transparent text-white hover:bg-transparent"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Signing in...' : 'Sign in'}
                    </Button>


                    <Button
                        type="button"
                        className="h-[70px] w-full  h-12  rounded-full border border-white bg-transparent text-white hover:bg-transparent"
                        disabled={googleLogin.isPending}
                        onClick={() => googleLogin.mutate()}
                    >
                        {googleLogin.isPending ? 'Signing in...' : 'Google'}
                    </Button>
                </div>
                {googleLogin.error && (
                    <p className="text-center text-sm text-red-400">
                        {getApiErrorMessage(googleLogin.error, 'Google login failed')}
                    </p>
                )}
            </form>
        </AuthShell>
    )
}
