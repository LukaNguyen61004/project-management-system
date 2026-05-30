import type { Request, Response } from "express";
import { createProjectSchema, inviteMemberSchema, acceptInvitationSchema, updateProjectSchema } from "../validatons/project.validation.js";
import {
    createProjectService, getUserProjectsServices, getProjectDetailService, inviteMemberService,
    acceptInvitationService,
    getProjectMembersService,
    removeProjectMembersService,
    leaveProjectService,
    updateProjectService,
    deleteProjectService
} from "../services/project.service.js";

export const createProjectController = async (req: Request, res: Response) => {
    try {

        const validatedData = createProjectSchema.parse(req.body);

        const project = await createProjectService(req.user!.userId, validatedData.project_name, validatedData.project_key, validatedData.project_description);

        res.status(201).json({
            success: true,
            project,
        })

    } catch (error) {
        res.status(400).json({
            succes: false,
            error: error instanceof Error ? error.message : "Unknow error"
        });
    }
};

export const getUserProjectsController = async (req: Request, res: Response) => {
    try {
        const projects = await getUserProjectsServices(req.user!.userId);

        res.status(200).json({
            success: true,
            projects,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknow error"
        });

    }
}

export const getProjectDetailController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid project Id",
            });
        }

        const project = await getProjectDetailService(projectId, req.user!.userId);

        res.status(200).json({
            success: true,
            project,
        })

    } catch (error) {
        res.status(404).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknow error",
        })

    }
}

export const inviteMemberController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid project Id",
            });
        }

        const validateData = inviteMemberSchema.parse(req.body);

        const invitation = await inviteMemberService(projectId, req.user!.userId, validateData.email);

        res.status(201).json({
            success: true,
            invitation
        })
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknow error",
        })
    }
}

export const acceptInvitationController = async (req: Request, res: Response) => {
    try {
        const validatedData = acceptInvitationSchema.parse(req.body);

        const result = await acceptInvitationService(validatedData.token, req.user!.userId);

        res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });

    }
};

export const getProjectMembersController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            res.status(400).json({
                success: false,
                error: "Invalid project id",
            })
        }

        const members = await getProjectMembersService(projectId);

        res.status(200).json({
            success: "true",
            members,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        })

    }
}

export const removeProjectMemberController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const targetUserId = Number(req.params.userId);

        if (isNaN(projectId) || isNaN(targetUserId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid ids",
            })
        }

        const result = await removeProjectMembersService(projectId, req.user!.userId, targetUserId);

        res.status(200).json({
            success: true,
            result,
        })

    } catch (error) {
        res.status(500).json({
            succes: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const leaveProjectController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid id",
            })
        }

        const result = await leaveProjectService(projectId, req.user!.userId);

        res.status(200).json({
            success: true,
            result,
        })
    } catch (error) {
        res.status(500).json({
            succes: false,
            error: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const updateProjectController = async (req: Request, res: Response) => {
    try {

        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid project id",
            });
        }

        const validatedData = updateProjectSchema.parse(req.body);

        const updatedProject = await updateProjectService(projectId, validatedData);

        res.status(200).json({
            success: true,
            project: updatedProject,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const deleteProjectController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid project id",
            });
        }

        const result = await deleteProjectService(projectId, req.user!.userId);

        res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}






