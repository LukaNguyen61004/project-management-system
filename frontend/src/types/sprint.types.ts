import type { SprintStatus } from './enums'
import type { Issue } from './issue.types'

export interface Sprint {
  sprint_id: number
  project_id: number
  sprint_name: string
  description: string | null
  sprint_status: SprintStatus
  start_date: string | null
  end_date: string | null
  created_by: number
  sprint_created_at: string
  sprint_updated_at: string
  sprint_summary: string | null
  sprint_summary_created_at: string | null
}

export interface CreateSprintInput {
  sprint_name: string
  description?: string
  start_date?: string
  end_date?: string
}

export interface SprintWithIssues extends Sprint {
  issues?: Issue[]
}

export interface UpdateSprintInput {
  sprint_name?: string
  description?: string
  start_date?: string
  end_date?: string
}