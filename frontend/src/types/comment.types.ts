import type { UserSummary } from "./issue.types";


export interface Comment {
    comment_id: number,
    issue_id: number,
    user_id: number, 
    content: string, 
    created_at:string,
    updated_at: string,
    user?: UserSummary
}