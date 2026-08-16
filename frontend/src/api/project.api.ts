import { apiClient } from "./client"
import type { Project, CreateProjectInput } from "../types/project.types"
import type { ProjectMember } from '../types/project.types'


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
        apiClient.post<{
            success: boolean
            invitation: {
                emailSent?: boolean
                emailError?: string
                [key: string]: unknown
            }
        }>(`/projects/${projectId}/invite`, { email }),

    removeMember: (projectId: number, userId: number) =>
        apiClient.delete(`/projects/${projectId}/members/${userId}`),

    leave: (projectId: number) =>
        apiClient.post<{ success: boolean; result: { message: string } }>(
            `/projects/${projectId}/leave`
        ),

    create: (data: CreateProjectInput) =>
        apiClient.post<{ success: boolean, project: Project }>('/projects', data),

    update: (projectId: number, data: { project_name?: string; project_description?: string }) =>
        apiClient.patch<{ success: boolean; project: Project }>(`/projects/${projectId}`, data),

    delete: (projectId: number) =>
        apiClient.delete<{ success: boolean; message: string }>(`/projects/${projectId}`),

    acceptInvitation: (token: string) =>
        apiClient.post<{ success: boolean; message: string; project: Project }>(
            '/projects/invitations/accept',
            { token }
        ),

    getPendingInvitations: () =>
        apiClient.get<{
            success: boolean
            data: Array<{
                invitation_id: number
                project_id: number
                email: string
                token: string
                expires_at: string
                project: { project_id: number; project_name: string; project_key: string }
            }>
        }>('/projects/invitations/pending'),

    declineInvitation: (token: string) =>
        apiClient.post('/projects/invitations/decline', { token }),
}