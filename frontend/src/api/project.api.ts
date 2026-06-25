import { apiClient } from "./client"
import type {Project, CreateProjectInput} from "../types/project.type"

export const projectApi ={
    getAll:()=>
        apiClient.get<{success: boolean, projects: Project[]}>('/projects')
    ,

    create:(data: CreateProjectInput)=>
        apiClient.post<{success: boolean, project: Project}>('/projects',data)
}