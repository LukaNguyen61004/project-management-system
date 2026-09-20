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
    <header className={`relative z-20 cinder-glass rounded-[20px] lg:rounded-[30px] py-3 ${compact ? 'px-3' : 'px-4'} lg:py-4 ${compact ? 'lg:px-4' : 'lg:px-8'}`}>
      <div className={`flex items-center justify-between gap-2 lg:gap-4 ${compact ? 'w-full' : ''}`}>
        <div className="min-w-0 flex items-center gap-2 lg:gap-4">
          <span className="font-[Jua] text-[16px] lg:text-[20px] leading-none tracking-wide text-white shrink-0">
            CINDER
          </span>
          {compact && (
            <div className="min-w-0 border-l border-white/20 pl-2 lg:pl-4">
              <h1 className="text-sm lg:text-lg font-semibold text-white truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs lg:text-sm text-jira-text-subtle mt-0.5 truncate hidden sm:block">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 lg:gap-3 shrink-0">
          {children}
          <LanguageToggle />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
