import { getProjectMemberIds } from "../repositories/project.repository.js";
import { createNotificationService } from "../services/notification.service.js";
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

    for (const m of members) {
        if (m.user_id === senderId) continue;

        await createNotificationService(
            m.user_id,
            senderId,
            type,
            title,
            content,
            issueId,
            projectId,
            sprintId
        );
    }
};