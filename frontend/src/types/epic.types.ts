export interface Epic {
    epic_id: number
    project_id: number
    epic_name: string
    epic_description: string | null
    epic_color: string
    created_by: number
    epic_created_at: string
    epic_updated_at: string
    _count?: { issues: number }
    creator?: { user_name: string | null }
}


export interface CreateEpicInput {
  epic_name: string
  epic_description?: string
  epic_color?: string
}