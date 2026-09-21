import { apiClient } from './client'
import type { Issue, UpdateIssueInput } from '../types/issue.types'
import type { IssueStatus, IssueType, IssuePriority } from '../types/enums';


export interface CreateIssueInput {
  issue_name: string
  issue_description?: string
  issue_type: IssueType
  issue_priority: IssuePriority
  parent_issue_id?: number
}

export type IssueSprintScope = number | 'backlog'

export type GetProjectIssuesParams = {
  page?: number
  limit?: number
  sprint_id?: IssueSprintScope
}

export type IssueListPage = {
  issues: Issue[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
}

/** Query keys: invalidate ['issues', projectId] sẽ đụng mọi list của project */
export const issueListKey = {
  root: (projectId: number) => ['issues', projectId] as const,
  all: (projectId: number) => ['issues', projectId, 'all'] as const,
  backlog: (projectId: number, page: number) =>
    ['issues', projectId, 'backlog', page] as const,
  sprint: (projectId: number, sprintId: number) =>
    ['issues', projectId, 'sprint', sprintId] as const,
}

export async function fetchIssueList(
  projectId: number,
  params?: GetProjectIssuesParams,
): Promise<IssueListPage> {
  const r = await issueApi.getByProject(projectId, params)
  return { issues: r.data.result, pagination: r.data.pagination }
}

export const issueApi = {
  getByProject: (
    projectId: number,
    { page = 1, limit = 20, sprint_id }: GetProjectIssuesParams = {},
  ) =>
    apiClient.get<{
      success: boolean
      result: Issue[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPage: number
      }
    }>(`/issues/projects/${projectId}/issues`, {
      params: {
        page,
        limit,
        ...(sprint_id !== undefined ? { sprint_id } : {}),
      },
    }),

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
