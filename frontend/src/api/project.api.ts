import { apiClient } from "./client"
import type { Project, CreateProjectInput } from "../types/project.type"
import type { ProjectMember } from '../types/project.type'


export const projectApi = {
    getAll: () =>
        apiClient.get<{ success: boolean, projects: Project[] }>('/projects')
    ,
    getById: (projectId: number) =>
        apiClient.get<{ success: Boolean, project: Project }>(`/projects/${projectId}`)
    ,

    getMembers: (projectId: number) =>
        apiClient.get<{ members: ProjectMember[] }>(`/projects/${projectId}/members`),

    invite: (projectId: number, email: string) =>
        apiClient.post(`/projects/${projectId}/invite`, { email }),

    removeMember: (projectId: number, userId: number) =>
        apiClient.delete(`/projects/${projectId}/members/${userId}`),

    create: (data: CreateProjectInput) =>
        apiClient.post<{ success: boolean, project: Project }>('/projects', data),

    update: (projectId: number, data: { project_name?: string; project_description?: string }) =>
        apiClient.patch<{ success: boolean; project: Project }>(`/projects/${projectId}`, data),

    acceptInvitation: (token: string) =>
        apiClient.post<{ success: boolean; message: string; project: Project }>(
            '/projects/invitations/accept',
            { token }
        ),
}