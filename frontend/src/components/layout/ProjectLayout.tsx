import { Navigate, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectApi } from "../../api/project.api";
import { useAuthStore } from "../../store/auth.store";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

export function ProjectLayout() {
    const { projectId } = useParams();
    const pid = Number(projectId);
    const userId = useAuthStore((s) => s.user?.user_id);

    const { data: project, isError, isLoading } = useQuery({
        queryKey: ['project', pid, userId],
        queryFn: () => projectApi.getById(pid).then((r) => r.data.project),
        enabled: !!pid && !!userId,
        retry: false,
    });

    if (isError) {
        return <Navigate to="/projects" replace />;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <AppHeader
                    compact
                    title={isLoading ? 'Loading...' : (project?.project_name ?? 'Project')}
                    subtitle={project?.project_key}
                />
                <main className="flex-1 overflow-auto bg-jira-bg">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}