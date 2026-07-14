import type { Request, Response } from "express";
import { createEpicService, deleteEpicService, getEpicDetailService, getProjectEpicsService, updateEpicService } from "../services/epic.service.js";
import { sendError } from "../helper/httpError.js";

export const createEpicController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = req.user!.userId;

        const epic = await createEpicService(projectId, userId, req.body);

        return res.status(201).json({
            message: "Epic created successfully",
            data: epic,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const getProjectEpicsController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = req.user!.userId;

        const epics = await getProjectEpicsService(projectId, userId);

        return res.status(200).json({
            message: "Get project epics successfully",
            data: epics,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const getEpicDetailController = async (req: Request, res: Response) => {
    try {
        const epicId = Number(req.params.epicId);
        const userId = req.user!.userId;

        const epic = await getEpicDetailService(epicId, userId);

        return res.status(200).json({
            message: "Get epic successfully",
            data: epic,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const updateEpicController = async (req: Request, res: Response) => {
    try {
        const epicId = Number(req.params.epicId);
        const userId = req.user!.userId;

        const epic = await updateEpicService(epicId, userId, req.body);

        return res.status(200).json({
            message: "Epic updated successfully",
            data: epic,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const deleteEpicController = async (req: Request, res: Response) => {
    try {
        const epicId = Number(req.params.epicId);
        const userId = req.user!.userId;

        await deleteEpicService(epicId, userId);

        return res.status(200).json({
            message: "Epic deleted successfully",
        });
    } catch (error) {
        return sendError(res, error);
    }
};
