import { apiClient } from "./client"
import type { Comment } from "../types/comment.types"


export const commentApi ={
    getByIssue: (issueId: number) =>
        apiClient.get<{data: Comment[]}>(`/comments/issues/${issueId}/comments`),

    create: (issueId: number, content: string) =>
        apiClient.post(`/comments/issues/${issueId}/comments`, { content }),

    update: (issueId: number, commentId: number, content: string) =>
        apiClient.patch(`/comments/issues/${issueId}/comments/${commentId}`, { content }),

    delete: (issueId: number, commentId: number)=>
        apiClient.delete(`/comments/issues/${issueId}/comments/${commentId}`),
    
}