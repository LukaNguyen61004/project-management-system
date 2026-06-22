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


export const createIssueController = async (req: Request, res: Response) => {
    try {
        const validatedData = createIssueSchema.parse(req.body);

        const projectId = Number(req.params.projectId);

        const reporterId = req.user!.userId;

        const issue = await createIssueService(
            projectId,
            reporterId,
            validatedData
        );

        return res.status(201).json({
            message: "Issue created successfully",
            data: issue,
        });

    } catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }

}

export const getProjectIssuesController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const currentUserId = req.user!.userId

        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid project id",
            });
        }


        const result = await getProjectIssueService(projectId, currentUserId);

        res.status(200).json({
            success: true,
            result,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const getIssueDetailController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid issue id",
            });
        }

        const currentUserId = req.user!.userId;

        const result = await getIssueDetailService(issueId, currentUserId);

        res.status(200).json({
            success: true,
            result,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })

    }
}

export const updateIssueController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid issue id",
            });
        }

        const currentUserId = req.user!.userId;

        const validateData = updateIssueSchema.parse(req.body);

        const result = await updateIssueService(issueId, currentUserId, validateData);

        res.status(200).json({
            success: true,
            issue: result
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const deleteIssueController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid issue id",
            });
        }

        const currentUserId = req.user!.userId;

        const result = await deleteIssueService(issueId, currentUserId);

        res.status(200).json({
            success: true,
            ...result,
        })
    } catch (error) {

        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })

    }
}

export const changeIssueStatusController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid issue id",
            });
        }

        const validateData = changeIssueStatusSchema.parse(req.body);
        const currentUser = req.user!.userId

        const result = await changeIssueStatusService(issueId, validateData, currentUser);

        res.status(200).json({
            success: true,
            data: result,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const assignIssueController = async (req: Request, res: Response) => {
    try {

        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid issue id",
            });
        }

        const validateData = assignIssueSchema.parse(req.body);
        const currentUser = req.user!.userId

        const result = await assignIssueService(issueId, validateData, currentUser);

        res.status(200).json({
            success: true,
            data: result,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })

    }
}

export const changIssuePriorityController = async (req: Request, res: Response) => {
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid issue id",
            });
        }

        const validateData = changeIssuePrioritySchema.parse(req.body);
        const currentUser = req.user!.userId

        const result = await changeIssuePriorityService(issueId, validateData, currentUser);
        res.status(200).json({
            success: true,
            data: result,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const updateIssueSprintController = async( req:Request, res:Response)=>{
    try {
        const issueId = Number(req.params.issueId);

        if (isNaN(issueId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid issue id",
            });
        }

        const validateData = updateIssueSprintSchema.parse(req.body);
        const currentUser = req.user!.userId

        const result = await updateIssueSprintService(issueId,currentUser, validateData);

        res.status(200).json({
            success: true,
            data: result,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const updateIssueEpicController = async (req: Request,  res: Response) => {
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

        if (error instanceof Error) {

            switch (error.message) {

                case "Issue not found":
                    return res.status(404).json({
                        error: error.message,
                    });

                case "Epic not found":
                    return res.status(404).json({
                        error: error.message,
                    });

                case "You are not a member of this project":
                    return res.status(403).json({
                        error: error.message,
                    });

                case "Epic does not belong to this project":
                    return res.status(400).json({
                        error: error.message,
                    });
            }
        }

        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};