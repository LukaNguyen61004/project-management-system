import type { Request, Response } from "express";
import { changeSprintStatusSchema, createSprintSchema, updateSprintSchema } from "../validatons/sprint.validation.js";
import { changeStatusSprintService, createSprintService, getProjectSprintsService, getSprintDetailService, getSprintIssuesService, updateSprintService } from "../services/sprint.service.js";

export const createSprintController = async (req: Request, res: Response) => {
    try {

        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid sprint id",
            });
        }

        const currentUserId = req.user!.userId;

        const validatedData = createSprintSchema.parse(req.body);

        const sprint = await createSprintService(projectId, currentUserId, validatedData);

        return res.status(201).json({
            success: true,
            data: sprint,
        });

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
};

export const getProjectSprintsController = async (req: Request, res: Response) => {
    try {

        const projectId = Number(req.params.projectId);
        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid sprint id",
            });
        }

        const currentUserId = req.user!.userId;

        const sprints = await getProjectSprintsService(projectId, currentUserId);

        return res.status(200).json({
            success: true,
            data: sprints,
        });

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
};

export const getSprintDetailController = async (req: Request, res: Response) => {
    try {

        const sprintId = Number(req.params.sprintId);

        if (isNaN(sprintId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid sprint id",
            });
        }

        const currentUserId = req.user!.userId;

        const sprint = await getSprintDetailService(sprintId, currentUserId);

        return res.status(200).json({
            success: true,
            data: sprint,
        });

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
};

export const updateSprintController = async (req: Request, res: Response) => {
    try {

        const sprintId = Number(req.params.sprintId);

        if (isNaN(sprintId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid sprint id",
            });
        }

        const currentUserId = req.user!.userId;

        const validatedData = updateSprintSchema.parse(req.body);

        const sprint = await updateSprintService(sprintId, currentUserId, validatedData);

        return res.status(200).json({
            success: true,
            data: sprint,
        });

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
};

export const changeSprintStatusController = async (req: Request, res: Response) => {
    try {

        const sprintId = Number(req.params.sprintId);

        if (isNaN(sprintId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid sprint id",
            });
        }

        const currentUserId = req.user!.userId;

        const validatedData = changeSprintStatusSchema.parse(req.body);

        const sprint = await changeStatusSprintService(sprintId, currentUserId, validatedData);

        return res.status(200).json({
            success: true,
            data: sprint,
        });

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
};

export const getSprintIssuesController = async (req: Request, res: Response) => {
    try {

        const sprintId = Number(req.params.sprintId);

        if (isNaN(sprintId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid sprint id",
            });
        }

        const currentUserId = req.user!.userId;

        const result = await getSprintIssuesService(sprintId, currentUserId);
        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}