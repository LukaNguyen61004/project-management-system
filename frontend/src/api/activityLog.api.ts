import { apiClient } from './client'
import type { ActivityLogResult } from '../types/activityLog.types'

export const activityApi = {
  getByProject: (projectId: number, page = 1, limit = 10) =>
    apiClient.get<{ success: boolean; result: ActivityLogResult }>(
      `/activities/projects/${projectId}/activity`,
      { params: { page, limit } }
    ),
}