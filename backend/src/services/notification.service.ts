import type { NotificationType } from "@prisma/client";
import type { CreateNotificationData } from "../types/notification.type.js";
import { createNotification, getNotificationsByUser, markAllAsRead, markAsRead } from "../repositories/notification.repository.js"


export const getNotificationsService = async(receiverId: number)=>{
    return getNotificationsByUser(receiverId);
}

export const markAsReadService = async(notifiId: number)=>{
    return markAsRead(notifiId);
}

export const markAllAsReadService = async(receiverId: number)=>{
    return markAllAsRead(receiverId);
}

 export const createNotificationService = async(
    receiverId: number,
    senderId: number | null,
    type: NotificationType,
    title: string,
    content: string,
    issueId?: number,
    projectId?: number,
    sprintId?: number
)=> {
    const notificationData: CreateNotificationData = {
    receiver_id: receiverId,
    sender_id: senderId,
    notifi_type: type,
    notifi_title: title,
    notifi_content: content,

    ...(issueId !== undefined && {
        related_issue_id: issueId,
    }),

    ...(projectId !== undefined && {
        related_project_id: projectId,
    }),

    ...(sprintId !== undefined && {
        related_sprint_id: sprintId,
    }),
};

return createNotification(notificationData);
}