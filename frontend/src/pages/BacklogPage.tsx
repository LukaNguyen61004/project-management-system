import { useParams } from "react-router-dom";

export function BacklogPage(){
    const {projectId} = useParams();
    return <div className="p-6">Backlog</div>
}