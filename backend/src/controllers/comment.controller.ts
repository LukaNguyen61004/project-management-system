import type { Request, Response } from "express";
import { createCommentSchema, updateCommentSchema } from "../validatons/comment.validation.js";
import { createCommentService, deleteCommentService, getIssueCommentsService, updateCommentService } from "../services/comment.service.js";
import { sendError } from "../helper/httpError.js";

export const createCommentController = async (req: Request, res: Response) => {
    try {
        const validatedData = createCommentSchema.parse(req.body);
        const issueId = Number(req.params.issueId);
        const currentUserId = req.user!.userId;

        const comment = await createCommentService(
            issueId,
            currentUserId,
            validatedData
        );

        return res.status(201).json({
            message: "Comment created successfully",
            data: comment,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const getIssueCommentsController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);
        const currentUserId = req.user!.userId;

        const comments = await getIssueCommentsService(issueId, currentUserId);

        return res.status(200).json({
            data: comments,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const updateCommentController = async (req: Request, res: Response) => {
    try {
        const validatedData = updateCommentSchema.parse(req.body);
        const issueId = Number(req.params.issueId);
        const commentId = Number(req.params.commentId);
        const currentUserId = req.user!.userId;

        const updatedComment = await updateCommentService(
            issueId,
            commentId,
            currentUserId,
            validatedData
        );

        return res.status(200).json({
            message: "Comment updated successfully",
            data: updatedComment,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const deleteCommentController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);
        const commentId = Number(req.params.commentId);
        const currentUserId = req.user!.userId;

        const result = await deleteCommentService(
            issueId,
            commentId,
            currentUserId
        );

        return res.status(200).json(result);
    } catch (error) {
        return sendError(res, error, 400);
    }
};
