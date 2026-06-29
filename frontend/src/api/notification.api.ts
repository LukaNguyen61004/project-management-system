import { apiClient } from './client'
import type { Notification } from '../types/notification.types'

export const notificationApi = {
  getAll: () =>
    apiClient.get<{ message: string; data: Notification[] }>('/notifications'),

  markAsRead: (notifiId: number) =>
    apiClient.patch(`/notifications/${notifiId}/read`),

  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),
}