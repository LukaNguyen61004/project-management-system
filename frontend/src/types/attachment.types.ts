import type { UserSummary } from './issue.types'

export type AttachmentType = 'image' | 'file' | 'link'

export interface IssueAttachment {
  attachment_id: number
  issue_id: number
  user_id: number
  attachment_type: AttachmentType
  file_name: string
  file_url: string
  created_at: string
  user?: UserSummary
}