export interface NotificationSender {
  user_id: number
  user_name: string | null
  user_avatar_url: string | null
}

export interface Notification {
  notifi_id: number
  receiver_id: number
  sender_id: number | null
  notifi_type: string
  notifi_title: string
  notifi_content: string
  is_read: boolean
  related_issue_id: number | null
  related_project_id: number | null
  related_sprint_id: number | null
  notifi_created_at: string
  sender?: NotificationSender | null
}