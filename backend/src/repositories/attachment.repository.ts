import prisma from "../lib/prisma.js"
import type { AttachmentType } from "@prisma/client"
import type { CreateAttrachmentInput } from "../validations/attachment.validation.js"

export const createAttachment = async (issueId: number, userId: number, data: CreateAttrachmentInput) => {
    return prisma.issueAttachment.create({
        data: {
            issue_id: issueId,
            user_id: userId,
            attachment_type: data.attachment_type as AttachmentType,
            file_name: data.file_name,
            file_url: data.file_url,
        },
        include: {
            user: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_avatar_url: true,
                },
            },
        }
    })
}

export const getAttachmentById = async (attchmentId: number) => {
    return prisma.issueAttachment.findUnique({
        where: {
            attachment_id: attchmentId,
        },
        include: {
            issue: {
                select: {
                    issue_id: true,
                    project_id: true,
                },
            },
            user: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_avatar_url: true,
                },
            },
        }
    })
}

export const getIssueAttachments = async (issueId: number) => {
    return prisma.issueAttachment.findMany({
        where: { issue_id: issueId },
        include: {
            user: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_avatar_url: true,
                },
            },
        },
        orderBy: { created_at: "desc" },
    });
};

export const deleteAttachment = async (attachmentId: number) => {
    return prisma.issueAttachment.delete({
        where: { attachment_id: attachmentId },
    });
};