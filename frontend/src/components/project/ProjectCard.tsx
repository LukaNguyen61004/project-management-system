import { Link } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import type { Project } from "../../types/project.type"

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link to={`/projects/${project.project_id}/board`}
            className="block bg-white rounded-lg border border-jira-border p-5 hover:shadow-md hover:border-jira-blue transition-all group">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-jira-blue-light flex items-center justify-center shrink-0">
                    <FolderKanban size={20} className="text-jira-blue" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-jira-text truncate">
                        {project.project_name}
                    </h3>
                    <p className="text-xs text-jira-text-subtle mt-0.5">
                        {project.project_key}
                    </p>
                    {project.project_description && (
                        <p className="text-sm text-jira-text-subtle mt-2 line-clamp-2">
                            {project.project_description}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}