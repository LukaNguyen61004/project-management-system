import type { Request, Response } from "express";
import { getProjectActivityLogSchema } from "../validatons/activityLog.validation.js";
import { getProjectActivityLogService } from "../services/activityLog.service.js";

export const getProjectActivityLogController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        const { page, limit } = getProjectActivityLogSchema.parse(req.query);

        const currentUser = req.user!.userId;

        const result = await getProjectActivityLogService(projectId, currentUser, page, limit);

        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknow error"
        });
    }
}