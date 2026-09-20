import { Navigate, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectApi } from "../../api/project.api";
import { useAuthStore } from "../../store/auth.store";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import { CinderBackdrop } from "./CinderBackdrop";
import { useT } from "../../i18n/useT";

export function ProjectLayout() {
    const { projectId } = useParams();
    const pid = Number(projectId);
    const userId = useAuthStore((s) => s.user?.user_id);
    const t = useT()

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
        <div className="relative min-h-screen">
            <CinderBackdrop />
            <div className="relative z-10 flex gap-4 p-6 min-h-screen">
                <Sidebar />

                <div className="flex-1 flex flex-col min-w-0 gap-4">
                    <AppHeader
                        compact
                        title={isLoading ? t('common.loading') : (project?.project_name ?? t('common.project'))}
                        subtitle={project?.project_key}
                    />
                    <main className="relative flex-1 min-h-0 rounded-[30px] flex flex-col">
                        <div className="cinder-glass pointer-events-none absolute inset-0 rounded-[30px]" />
                        <div className="relative flex-1 overflow-auto min-h-0">
                          <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
