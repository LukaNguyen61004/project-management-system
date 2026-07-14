import type { Request, Response } from "express";

import {
    assignIssueService, changeIssuePriorityService, changeIssueStatusService, createIssueService,
    deleteIssueService, getIssueDetailService, getProjectIssueService,
    updateIssueEpicService,
    updateIssueService,
    updateIssueSprintService
} from "../services/issue.service.js";

import {
    assignIssueSchema, changeIssuePrioritySchema, changeIssueStatusSchema, createIssueSchema,
    updateIssueSchema,
    updateIssueSprintSchema
} from "../validatons/issue.validation.js";
import { sendError } from "../helper/httpError.js";


export const createIssueController = async (req: Request, res: Response) => {
    try {
        const validatedData = createIssueSchema.parse(req.body);
        const projectId = Number(req.params.projectId);
        const reporterId = req.user!.userId;

        const issue = await createIssueService(projectId, reporterId, validatedData);

        return res.status(201).json({
            message: "Issue created successfully",
            data: issue,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const getProjectIssuesController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const currentUserId = req.user!.userId;

        if (isNaN(projectId)) {
            return sendError(res, new Error("Invalid project id"), 400);
        }

        const result = await getProjectIssueService(projectId, currentUserId);

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const getIssueDetailController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return sendError(res, new Error("Invalid issue id"), 400);
        }

        const currentUserId = req.user!.userId;
        const result = await getIssueDetailService(issueId, currentUserId);

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const updateIssueController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return sendError(res, new Error("Invalid issue id"), 400);
        }

        const currentUserId = req.user!.userId;
        const validateData = updateIssueSchema.parse(req.body);
        const result = await updateIssueService(issueId, currentUserId, validateData);

        return res.status(200).json({
            success: true,
            issue: result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const deleteIssueController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return sendError(res, new Error("Invalid issue id"), 400);
        }

        const currentUserId = req.user!.userId;
        const result = await deleteIssueService(issueId, currentUserId);

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const changeIssueStatusController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return sendError(res, new Error("Invalid issue id"), 400);
        }

        const validateData = changeIssueStatusSchema.parse(req.body);
        const currentUser = req.user!.userId;
        const result = await changeIssueStatusService(issueId, validateData, currentUser);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const assignIssueController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return sendError(res, new Error("Invalid issue id"), 400);
        }

        const validateData = assignIssueSchema.parse(req.body);
        const currentUser = req.user!.userId;
        const result = await assignIssueService(issueId, validateData, currentUser);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const changIssuePriorityController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return sendError(res, new Error("Invalid issue id"), 400);
        }

        const validateData = changeIssuePrioritySchema.parse(req.body);
        const currentUser = req.user!.userId;
        const result = await changeIssuePriorityService(issueId, validateData, currentUser);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const updateIssueSprintController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return sendError(res, new Error("Invalid issue id"), 400);
        }

        const validateData = updateIssueSprintSchema.parse(req.body);
        const currentUser = req.user!.userId;
        const result = await updateIssueSprintService(issueId, currentUser, validateData);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const updateIssueEpicController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);
        const currentUserId = req.user!.userId;
        const { epic_id } = req.body;

        const issue = await updateIssueEpicService(issueId, epic_id, currentUserId);

        return res.status(200).json({
            message: "Issue epic updated successfully",
            data: issue,
        });
    } catch (error) {
        return sendError(res, error);
    }
};
