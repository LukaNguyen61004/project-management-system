import { apiClient } from './client'
import type { AttachmentType, IssueAttachment } from '../types/attachment.types'

export const attachmentApi = {
  getByIssue: (issueId: number) =>
    apiClient.get<{ success: boolean; data: IssueAttachment[] }>(
      `/attachments/issues/${issueId}`
    ),

  create: (
    issueId: number,
    data: {
      attachment_type: AttachmentType
      file_name: string
      file_url: string
    }
  ) =>
    apiClient.post<{ success: boolean; data: IssueAttachment }>(
      `/attachments/issues/${issueId}`,
      data
    ),

  delete: (attachmentId: number) =>
    apiClient.delete<{ success: boolean; message: string }>(
      `/attachments/${attachmentId}`
    ),
}