import { apiClient } from './client'
import type { Issue, UpdateIssueInput } from '../types/issue.types'
import type { IssueStatus, IssueType, IssuePriority } from '../types/enums';


export interface CreateIssueInput {
  issue_name: string
  issue_description?: string
  issue_type: IssueType
  issue_priority: IssuePriority
}

export const issueApi = {
  getByProject: (projectId: number) =>
    apiClient.get<{ success: boolean; result: Issue[] }>(
      `/issues/projects/${projectId}/issues`
    ),

  changeStatus: (issueId: number, issue_status: IssueStatus) =>
    apiClient.patch(`/issues/${issueId}/status`, { issue_status }),

  changePriority: (issueId: number, issue_priority: IssuePriority) =>
    apiClient.patch(`/issues/${issueId}/priority`, { issue_priority }),

  getById: (issueId: number) =>
    apiClient.get<{ success: boolean; result: Issue }>(`/issues/${issueId}`),

  create: (projectId: number, data: CreateIssueInput) =>
    apiClient.post<{ message: string; data: Issue }>(
      `/issues/projects/${projectId}`,
      data
    ),

  update: (issueId: number, data: UpdateIssueInput) =>
    apiClient.patch<{ success: boolean; issue: Issue }>(`/issues/${issueId}`, data),

  updateEpic: (issueId: number, epic_id: number | null) =>
    apiClient.patch(`/issues/${issueId}/epic`, { epic_id }),

  delete: (issueId: number) =>
    apiClient.delete(`/issues/${issueId}`),

  assign: (issueId: number, assignee_id: number | null) =>
    apiClient.patch(`/issues/${issueId}/assign`, { assignee_id }),

  updateSprint: (issueId: number, sprint_id: number | null) =>
    apiClient.patch(`/issues/${issueId}/sprint`, { sprint_id })
}