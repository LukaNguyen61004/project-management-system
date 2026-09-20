import { UserMenu } from './UserMenu'
import { NotificationBell } from '../notification/NotificationBell'
import { LanguageToggle } from './LanguageToggle'

interface AppHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode,
  compact?: boolean
}

export function AppHeader({ title, subtitle, children, compact }: AppHeaderProps) {
  return (
    <header className={`relative z-20 cinder-glass rounded-[30px] py-4 ${compact ? 'px-4' : 'px-8'}`}>
      <div className={`flex items-center justify-between gap-4 ${compact ? 'w-full' : ''}`}>
        <div className="min-w-0 flex items-center gap-4">
          <span className="font-[Jua] text-[20px] leading-none tracking-wide text-white shrink-0">
            CINDER
          </span>
          {compact && (
            <div className="min-w-0 hidden sm:block border-l border-white/20 pl-4">
              <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-jira-text-subtle mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {children}
          <LanguageToggle />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
