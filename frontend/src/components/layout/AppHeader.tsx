import { UserMenu } from './UserMenu'

interface AppHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function AppHeader({ title, subtitle, children }: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-jira-border px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
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
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
