import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { LayoutGrid, ListTodo, Settings, ChevronLeft } from 'lucide-react'

export function Sidebar() {
    const { projectId } = useParams();

    const navItems = [
        {
            to: `/projects/${projectId}/board`,
            icon: LayoutGrid,
            label: 'Board'
        },
        {
            to: `/projects/${projectId}/backlog`,
            icon: ListTodo,
            label: 'Backlog'
        },
        {
            to: `/projects/${projectId}/settings`,
            icon: Settings,
            label: 'Setting'
        }
    ]

    return (
        <aside className="w-16 lg:w-[240px] cinder-glass rounded-[30px] flex flex-col shrink-0 min-h-[calc(100vh-3rem)]">
            <div className="p-6 hidden lg:block">
                <p className="text-[32px] font-bold text-white">Menu</p>
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
                        <span className="hidden lg:block text-xl font-bold">{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-6">
                <NavLink
                    to="/projects"
                    className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
                    <ChevronLeft size={18} />
                    <span className="hidden lg:block text-sm font-bold">Back to Workspace</span>
                </NavLink>
            </div>
        </aside>
    )

}
