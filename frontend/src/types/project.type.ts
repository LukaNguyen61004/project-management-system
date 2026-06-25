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