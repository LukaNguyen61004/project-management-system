
import { createActivityLogService } from "./activityLog.service.js";
import { ActivityActionType, NotificationType } from "@prisma/client";
import { findIssueById } from "../repositories/issue.repository.js";
import { createComment, deleteComment, getCommentById, getIssueComments, updateComment } from "../repositories/comment.repository.js";
import type { CreateCommentInput, UpdateCommentInput } from "../validatons/comment.validation.js";
import { findProjectMember } from "../repositories/project.repository.js";
import { createNotificationService } from "./notification.service.js";

export const createCommentService = async (issueId: number, currentUserId: number, data: CreateCommentInput) => {

    const issue = await findIssueById(issueId);

    if (!issue) {
        throw new Error("Issue not found");
    }

    const currentUser = await findProjectMember(issue.project_id, currentUserId);

    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }


    const comment = await createComment(issue.issue_id, currentUser.user_id, data);

    await createActivityLogService({
        user_id: currentUser.user_id,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        comment_id: comment.comment_id,
        action_type: ActivityActionType.COMMENT_ADDED
    })

    if (issue.assignee_id && issue.assignee_id !== currentUserId) {
        await createNotificationService(
            issue.assignee_id,
            currentUserId,
            NotificationType.comment_added,
            "New comment",
            `New comment on issue #${issue.issue_id}`,
            issue.issue_id,
            issue.project_id
        );
    }

    return comment;
}

export const getIssueCommentsService = async (issueId: number, currentUserId: number) => {
    const issue = await findIssueById(issueId);

    if (!issue) {
        throw new Error("Issue not found");
    }

    const currentUser = await findProjectMember(issue.project_id, currentUserId);

    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }

    const listComments = await getIssueComments(issue.issue_id);

    return listComments;
}

export const updateCommentService = async (issueId: number, commentId: number, currentUserId: number, data: UpdateCommentInput) => {
    const issue = await findIssueById(issueId);
    if (!issue) {
        throw new Error("Issue not found");
    }

    const comment = await getCommentById(commentId);

    if (!comment) {
        throw new Error("Comment not found");
    }

    if (comment.issue_id !== issue.issue_id) {
        throw new Error("Comment does not belong to this issue");
    }

    const currentUser = await findProjectMember(issue.project_id, currentUserId);

    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }

    if (comment.user_id !== currentUser.user_id) {
        throw new Error("You are not an author of this comment");
    }


    const updated = await updateComment(comment.comment_id, data);

    await createActivityLogService({
        user_id: currentUser.user_id,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        comment_id: comment.comment_id,
        action_type: ActivityActionType.COMMENT_UPDATED,
    })

    return updated;
}

export const deleteCommentService = async (issueId: number, commentId: number, currentUserId: number) => {
    const issue = await findIssueById(issueId);
    if (!issue) {
        throw new Error("Issue not found");
    }

    const comment = await getCommentById(commentId);

    if (!comment) {
        throw new Error("Comment not found");
    }

    if (comment.issue_id !== issue.issue_id) {
        throw new Error("Comment does not belong to this issue");
    }

    const currentUser = await findProjectMember(issue.project_id, currentUserId);

    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }

    if (comment.user_id !== currentUser.user_id) {
        throw new Error("You are not an author of this comment");
    }


    await deleteComment(comment.comment_id);

    await createActivityLogService({
        user_id: currentUser.user_id,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        comment_id: comment.comment_id,
        action_type: ActivityActionType.COMMENT_DELETED,
    })

    return { message: "Comment deleted successfully" };

}