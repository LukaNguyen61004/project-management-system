import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

interface AuthShellProps {
  mode: 'signin' | 'signup'
  children: React.ReactNode
}

export function AuthShell({ mode, children }: AuthShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const switching = Boolean(
    (location.state as { authSwitch?: boolean } | null)?.authSwitch
  )
  const targetSide = mode === 'signup' ? 'left' : 'right'
  const [side, setSide] = useState<'left' | 'right'>(
    switching ? (targetSide === 'left' ? 'right' : 'left') : targetSide
  )
  const [instant, setInstant] = useState(!switching)

  useEffect(() => {
    if (!switching) {
      setSide(targetSide)
      setInstant(true)
      return
    }
    setInstant(false)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSide(targetSide))
    })
    return () => cancelAnimationFrame(id)
  }, [switching, targetSide])

  const qs = searchParams.get('redirect')
    ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
    : ''

  const handleToggle = () => {
    const next = mode === 'signin' ? `/register${qs}` : `/login${qs}`
    navigate(next, { state: { authSwitch: true } })
  }

  return (
    <div
      className={`auth-shell${instant ? ' auth-instant' : ''}`}
      data-side={side}
    >
      <div className="auth-art">
        <img src="/cinder/auth-panel.png" alt="" />
        <button
          type="button"
          className="auth-toggle"
          onClick={handleToggle}
          aria-label={mode === 'signin' ? 'Switch to register' : 'Switch to sign in'}
        >
          <span className="auth-toggle-knob" />
        </button>
      </div>
      <div className="auth-form-col">
        <div className="cinder-glass auth-glass w-full min-h-screen rounded-none p-10">
          <button
            type="button"
            className="auth-toggle auth-toggle-mobile"
            onClick={handleToggle}
            aria-label={mode === 'signin' ? 'Switch to register' : 'Switch to sign in'}
          >
            <span className="auth-toggle-knob" />
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}
