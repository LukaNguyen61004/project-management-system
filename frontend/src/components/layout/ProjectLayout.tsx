import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectApi } from "../../api/project.api";
import { AppHeader } from "./AppHeader";

export function ProjectLayout() {
    const { projectId } = useParams();
    const pid = Number(projectId);

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', pid],
        queryFn: () => projectApi.getById(pid).then((r) => r.data.project),
        enabled: !!pid,
    })
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <AppHeader
                    compact
                    title={project?.project_name ?? 'Loading...'}
                    subtitle={project?.project_key}
                />
                <main className="flex-1 overflow-auto bg-jira-bg">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}