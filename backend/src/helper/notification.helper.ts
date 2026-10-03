import { getProjectMemberIds } from "../repositories/project.repository.js";
import { createNotifications } from "../repositories/notification.repository.js";
import { NotificationType } from "@prisma/client";

export const notifyProjectMembers = async (
    projectId: number,
    senderId: number,
    type: NotificationType,
    title: string,
    content: string,
    issueId?: number,
    sprintId?: number
) => {
    const members = await getProjectMemberIds(projectId);

    const rows = members
        .filter((m) => m.user_id !== senderId)
        .map((m) => ({
            receiver_id: m.user_id,
            sender_id: senderId,
            notifi_type: type,
            notifi_title: title,
            notifi_content: content,
            ...(issueId !== undefined && { related_issue_id: issueId }),
            ...(projectId !== undefined && { related_project_id: projectId }),
            ...(sprintId !== undefined && { related_sprint_id: sprintId }),
        }))

    await createNotifications(rows)
};