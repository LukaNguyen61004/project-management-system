import { apiClient } from './client'

export interface MemberProgress {
    name: string
    assigned: number
    done: number
    incomplete: number
    completion_pct: number
    incomplete_keys: string[]
}

export interface ManagerStats {
    total: number
    done: number
    completion_rate: string
    overdue_count: number
    overdue_keys: string[]
    unassigned_count: number
}

export interface SprintSummaryResult {
    stats: {
        total: number
        done: number
        in_review: number
        in_progress: number
        todo: number
        completion_rate: string
    }
    member_progress: MemberProgress[]
    manager_stats: ManagerStats
    schedule_changes?: Array<{
        field_name: string | null
        old_value: string | null
        new_value: string | null
        reason: string | null
        created_at: string
        issue_id: number | null
        sprint_id: number | null
    }>
    summary: string
    cached: boolean
}

export const aiApi = {
    summarizeSprint: (sprintId: number) =>
        apiClient.post<{ success: boolean; data: SprintSummaryResult }>(
            `/ai/sprints/${sprintId}/summarize`
        ),
}
