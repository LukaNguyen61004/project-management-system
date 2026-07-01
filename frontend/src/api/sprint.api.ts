import { apiClient } from './client'
import type { CreateSprintInput, Sprint } from '../types/sprint.types'
import type { Issue } from '../types/issue.types'
import type { SprintStatus } from '../types/enums'

export const sprintApi = {
    getByProject: (projectId: number) =>
        apiClient.get<{ success: boolean; data: Sprint[] }>(`/sprints/projects/${projectId}/sprints`),

    getById: (sprintId: number) =>
        apiClient.get<{ success: boolean; data: Sprint }>(`/sprints/${sprintId}`),

    getIssues: (sprintId: number) =>
        apiClient.get<{ success: boolean; data: Issue[] }>(`/sprints/${sprintId}/issues`),

    create: (projectId: number, data: CreateSprintInput) =>
        apiClient.post(`/sprints/projects/${projectId}/sprints`, data),

    update: (sprintId: number, data: Partial<CreateSprintInput>) =>
        apiClient.patch(`/sprints/${sprintId}`, data),

    changeStatus: (sprintId: number, sprint_status: SprintStatus) =>
        apiClient.patch(`/sprints/${sprintId}/status`, { sprint_status }),
    
}