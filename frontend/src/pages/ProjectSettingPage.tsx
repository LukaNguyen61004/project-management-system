import { useParams } from "react-router-dom";

export function ProjectSettingPage(){
    const {projectId} = useParams();
    return <div className="p-6">Project Setting</div>
}