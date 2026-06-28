import type { UserRole } from "./enums"
export interface Project {
    project_id: number,
    project_name: string, 
    project_key: string,
    project_description: string | null,
    owner_id: number,
    project_created_at: string
}

export interface CreateProjectInput {
    project_name: string,
    project_key: string
    project_description?:string,
}

export interface ProjectMember {
  pm_id: number
  project_id: number
  user_id: number
  role: UserRole
  joined_at: string
  user: {
    user_id: number
    user_name: string | null
    user_email: string
    user_avatar_url: string | null
  }
}