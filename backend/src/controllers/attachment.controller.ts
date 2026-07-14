import type { Request, Response } from "express";
import { createAttachmentSchema } from "../validatons/attachment.validation.js";
import { createAttachmentService, deleteAttachmentService, getIssueAttachmentsService } from "../services/attachment.service.js";
import { sendError } from "../helper/httpError.js";

export const getIssueAttachmentsController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);
        const currentUserId = req.user!.userId;
        const attachments = await getIssueAttachmentsService(issueId, currentUserId);
        return res.status(200).json({
            success: true,
            data: attachments,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const createAttachmentController = async (req: Request, res: Response) => {
    try {
        const validatedData = createAttachmentSchema.parse(req.body);
        const issueId = Number(req.params.issueId);
        const currentUserId = req.user!.userId;
        const attachment = await createAttachmentService(
            issueId,
            currentUserId,
            validatedData
        );
        return res.status(201).json({
            success: true,
            message: "Attachment created successfully",
            data: attachment,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const deleteAttachmentController = async (req: Request, res: Response) => {
    try {
        const attachmentId = Number(req.params.attachmentId);
        const currentUserId = req.user!.userId;
        const result = await deleteAttachmentService(attachmentId, currentUserId);
        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};
