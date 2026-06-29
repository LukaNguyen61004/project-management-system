export interface ActivityUser {
  user_id: number
  user_name: string | null
  user_avatar_url: string | null
}

export interface ActivityLog {
  log_id: number
  user_id: number
  project_id: number
  issue_id: number | null
  sprint_id: number | null
  action_type: string
  field_name: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
  user?: ActivityUser
  issue?: { issue_id: number; issue_name: string }
  sprint?: { sprint_id: number; sprint_name: string }
}

export interface ActivityLogResult {
  activities: ActivityLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
}