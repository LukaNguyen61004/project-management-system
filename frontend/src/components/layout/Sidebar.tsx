import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { LayoutGrid, ListTodo, Settings, ChevronLeft } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { cn } from '../../utils/cn'

export function Sidebar() {
    const { projectId } = useParams();
    const t = useT()

    const navItems = [
        { to: `/projects/${projectId}/board`, icon: LayoutGrid, label: t('nav.board') },
        { to: `/projects/${projectId}/backlog`, icon: ListTodo, label: t('nav.backlog') },
        { to: `/projects/${projectId}/settings`, icon: Settings, label: t('nav.settings') },
    ]

    return (
        <>
            <aside className="hidden lg:flex w-[240px] cinder-glass rounded-[30px] flex-col shrink-0 min-h-[calc(100vh-3rem)]">
                <div className="p-6">
                    <p className="text-[32px] font-bold text-white">{t('nav.menu')}</p>
                </div>
                <nav className="flex-1 py-2">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-6 py-4 mx-2 text-sm cursor-pointer transition-all border-transparent ${isActive
                                    ? 'border-white/40 text-white'
                                    : 'text-white/70 hover:bg-jira-sidebar-hover hover:text-white'
                                }`
                            }
                        >
                            <Icon size={20} className="shrink-0" />
                            <span className="text-xl font-bold">{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-6">
                    <NavLink
                        to="/projects"
                        className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
                        <ChevronLeft size={18} />
                        <span className="text-sm font-bold">{t('nav.backToWorkspace')}</span>
                    </NavLink>
                </div>
            </aside>

            <nav
                className="lg:hidden fixed bottom-0 inset-x-0 z-40 cinder-glass rounded-none border-x-0 border-b-0"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="grid grid-cols-4">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium',
                                    isActive ? 'text-white' : 'text-white/55'
                                )
                            }
                        >
                            <Icon size={20} />
                            {label}
                        </NavLink>
                    ))}
                    <NavLink
                        to="/projects"
                        className="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-white/55"
                    >
                        <ChevronLeft size={20} />
                        {t('nav.projects')}
                    </NavLink>
                </div>
            </nav>
        </>
    )
}
