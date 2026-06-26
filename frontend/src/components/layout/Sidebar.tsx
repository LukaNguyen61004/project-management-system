import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { LayoutGrid, ListTodo, Settings, ChevronLeft, FolderKanban, Icon, } from 'lucide-react'

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
            label: 'Settings'
        }
    ]

    return (
        <aside className="w-16 lg:w-56 bg-jira-sidebar flex flex-col shrink-0 min-h-screen" >
            <div className="p-3 border-b border-white/10">
                <NavLink to="/projects" className="flex items-center gap-2 text-white/90 hover:text-white">
                    <FolderKanban size={24} className="text-jira-blue shrink-0" />
                    <span className="hidden lg:block font-semibold text-sm">PMS</span>
                </NavLink>
            </div>
            <nav className="flex-1 py-2">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 mx-2 rounded text-sm transition-colors ${isActive
                                ? 'bg-jira-sidebar-hover text-white'
                                : 'text-white/70 hover:bg-jira-sidebar-hover hover:text-white'
                            }`
                        }
                    >
                        <Icon size={20} className="shrink-0" />
                        <span className="hidden lg:block">{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-3 border-t border-white/10">
                <NavLink
                    to="/projects"
                    className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
                    <ChevronLeft size={18} />
                    <span className="hidden lg:block">All projects</span>
                </NavLink>
            </div>
        </aside>
    )

}