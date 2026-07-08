import { apiClient } from './client'

export interface SprintSummaryResult {
    stats: {
        total: number
        done: number
        in_review: number
        in_progress: number
        todo: number
        completion_rate: string
    }
    summary: string
    cached: boolean
}

export const aiApi = {
    summarizeSprint: (sprintId: number) =>
        apiClient.post<{ success: boolean; data: SprintSummaryResult }>(
            `/ai/sprints/${sprintId}/summarize`
        ),
}