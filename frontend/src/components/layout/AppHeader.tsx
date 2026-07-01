import { UserMenu } from './UserMenu'
import { NotificationBell } from '../notification/NotificationBell'

interface AppHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode,
  compact?: boolean
}

export function AppHeader({ title, subtitle, children, compact }: AppHeaderProps) {
  return (
    <header className={`bg-white border-b border-jira-border  py-4 ${compact ? 'px-4' : 'px-6'}`}>
      <div className={`flex items-center justify-between gap-4 ${compact ? 'w-full' : 'max-w-6xl mx-auto'}`}>
        {/* Trái: title + subtitle */}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-jira-text truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-jira-text-subtle mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        {/* Phải: nút tùy trang + user menu */}
        <div className="flex items-center gap-3 shrink-0">
          {children}
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
