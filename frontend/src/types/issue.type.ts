import type { IssuePriority, IssueStatus, IssueType } from "./enums";

export interface UserSummary {
    user_id: number,
    user_name: string | null,
    user_email: string,
    user_avatar_url: string | null
}

export interface Issue {
    issue_id: number
    project_id: number
    sprint_id: number | null
    epic_id: number | null
    issue_key: string
    issue_name: string
    issue_description: string | null
    issue_type: IssueType
    issue_status: IssueStatus
    issue_priority: IssuePriority
    reporter_id: number
    assignee_id: number | null
    last_activity_at: string
    warning_count: number
    review_reject_count: number
    issue_created_at: string
    issue_updated_at: string
    
    reporter?: UserSummary
    assignee?: UserSummary | null
    sprint?: { sprint_id: number; sprint_name: string } | null
}

export interface UpdateIssueInput {
  issue_name?: string
  issue_description?: string
  issue_type?: IssueType
}

