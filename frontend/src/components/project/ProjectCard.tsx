import { Link } from "react-router-dom";
import type { Project } from "../../types/project.types"
import { formatShortDate } from "../../utils/date"

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link to={`/projects/${project.project_id}/board`}
            className="block cinder-glass rounded-[30px] p-5 min-h-[201px] hover:bg-white/10 transition-all group relative">
            <p className="absolute top-5 right-5 text-[12px] italic text-white/80">
                {formatShortDate(project.project_created_at)}
            </p>
            <h3 className="pr-24 text-[22px] font-bold text-white leading-tight line-clamp-2">
                {project.project_name}
            </h3>
            <p className="mt-2 text-[15px] italic text-white/50">
                {project.project_key}
            </p>
            {project.project_description && (
                <p className="text-sm text-jira-text-subtle mt-3 line-clamp-2">
                    {project.project_description}
                </p>
            )}
        </Link>
    )
}
