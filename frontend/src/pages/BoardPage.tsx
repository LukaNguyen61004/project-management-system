import { useParams } from "react-router-dom";

export function BoardPage(){
    const {projectId} = useParams();
    return <div className="p-6">Board - project {projectId}</div>
}