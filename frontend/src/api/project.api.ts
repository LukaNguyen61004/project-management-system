import { apiClient } from "./client"
import type {Project, CreateProjectInput} from "../types/project.type"

export const projectApi ={
    getAll:()=>
        apiClient.get<{success: boolean, projects: Project[]}>('/projects')
    ,
    getById: (projectId: number)=>
        apiClient.get<{success: Boolean, project:Project}>(`/projects/${projectId}`)
    ,

    create:(data: CreateProjectInput)=>
        apiClient.post<{success: boolean, project: Project}>('/projects',data)
}