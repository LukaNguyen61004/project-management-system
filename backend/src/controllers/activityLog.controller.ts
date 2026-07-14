import type { Request, Response } from "express";
import { getProjectActivityLogSchema } from "../validatons/activityLog.validation.js";
import { getProjectActivityLogService } from "../services/activityLog.service.js";
import { sendError } from "../helper/httpError.js";

export const getProjectActivityLogController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const { page, limit } = getProjectActivityLogSchema.parse(req.query);
        const currentUser = req.user!.userId;

        const result = await getProjectActivityLogService(projectId, currentUser, page, limit);

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};
