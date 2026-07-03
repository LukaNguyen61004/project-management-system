import { findIssueById, touchLastActivity } from "../repositories/issue.repository.js";
import { findProjectMember } from "../repositories/project.repository.js";
import { createAttachment, getAttachmentById, deleteAttachment, getIssueAttachments } from "../repositories/attachment.repository.js";
import type { CreateAttrachmentInput } from "../validatons/attachment.validation.js";

const assertProjectMember = async (projectId: number, userId: number) => {
    const member = await findProjectMember(projectId, userId);
    if (!member) {
        throw new Error("You are not a member of this project");
    }
    return member;
};

export const getIssueAttachmentsService = async (issueId: number, currentUserId: number) => {
    const issue = await findIssueById(issueId);

    if (!issue) {
        throw new Error("Issue not found");
    }
    await assertProjectMember(issue.project_id, currentUserId);
    return getIssueAttachments(issueId);
}

export const createAttachmentService = async (issueId: number, currentUserId: number, data: CreateAttrachmentInput) => {
    const issue = await findIssueById(issueId);
    if (!issue) {
        throw new Error("Issue not found");
    }
    const member = await assertProjectMember(issue.project_id, currentUserId);

    const attachment = await createAttachment(issue.issue_id, member.user_id, data);

    await touchLastActivity(issueId);

    return attachment;
}

export const deleteAttachmentService = async ( attachmentId: number, currentUserId: number) => {
    const attachment = await getAttachmentById(attachmentId);
    if (!attachment) {
        throw new Error("Attachment not found");
    }
    await assertProjectMember(attachment.issue.project_id, currentUserId);
    await deleteAttachment(attachment.attachment_id);
    await touchLastActivity(attachment.issue.issue_id);
    return { message: "Attachment deleted successfully" };
};
