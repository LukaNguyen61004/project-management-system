import type { Request, Response } from "express";
import { createProjectSchema, inviteMemberSchema, acceptInvitationSchema, updateProjectSchema, declineInvitationSchema } from "../validatons/project.validation.js";
import {
    createProjectService, getUserProjectsServices, getProjectDetailService, inviteMemberService,
    acceptInvitationService, getProjectMembersService, removeProjectMembersService,
    leaveProjectService, updateProjectService, deleteProjectService,
    declineInvitationService,
    getMyPendingInvitationsService
} from "../services/project.service.js";
import { sendError } from "../helper/httpError.js";

export const createProjectController = async (req: Request, res: Response) => {
    try {
        const validatedData = createProjectSchema.parse(req.body);

        const project = await createProjectService(
            req.user!.userId,
            validatedData.project_name,
            validatedData.project_key,
            validatedData.project_description
        );

        return res.status(201).json({
            success: true,
            project,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const getUserProjectsController = async (req: Request, res: Response) => {
    try {
        const projects = await getUserProjectsServices(req.user!.userId);

        return res.status(200).json({
            success: true,
            projects,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const getProjectDetailController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return sendError(res, new Error("Invalid project id"), 400);
        }

        const project = await getProjectDetailService(projectId, req.user!.userId);

        return res.status(200).json({
            success: true,
            project,
        });
    } catch (error) {
        return sendError(res, error, 404);
    }
};

export const inviteMemberController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return sendError(res, new Error("Invalid project id"), 400);
        }

        const validateData = inviteMemberSchema.parse(req.body);
        const invitation = await inviteMemberService(
            projectId,
            req.user!.userId,
            validateData.email
        );

        return res.status(201).json({
            success: true,
            invitation,
        });
    } catch (error) {
        return sendError(res, error, 404);
    }
};

export const acceptInvitationController = async (req: Request, res: Response) => {
    try {
        const validatedData = acceptInvitationSchema.parse(req.body);
        const result = await acceptInvitationService(validatedData.token, req.user!.userId);

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const getProjectMembersController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return sendError(res, new Error("Invalid project id"), 400);
        }

        const members = await getProjectMembersService(projectId);

        return res.status(200).json({
            success: true,
            members,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const removeProjectMemberController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);
        const targetUserId = Number(req.params.userId);

        if (isNaN(projectId) || isNaN(targetUserId)) {
            return sendError(res, new Error("Invalid ids"), 400);
        }

        const result = await removeProjectMembersService(
            projectId,
            req.user!.userId,
            targetUserId
        );

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const leaveProjectController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return sendError(res, new Error("Invalid project id"), 400);
        }

        const result = await leaveProjectService(projectId, req.user!.userId);

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

export const updateProjectController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return sendError(res, new Error("Invalid project id"), 400);
        }

        const currentUser = req.user!.userId;
        const validatedData = updateProjectSchema.parse(req.body);
        const updatedProject = await updateProjectService(projectId, currentUser, validatedData);

        return res.status(200).json({
            success: true,
            project: updatedProject,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const deleteProjectController = async (req: Request, res: Response) => {
    try {
        const projectId = Number(req.params.projectId);

        if (isNaN(projectId)) {
            return sendError(res, new Error("Invalid project id"), 400);
        }

        const result = await deleteProjectService(projectId, req.user!.userId);

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const getMyPendingInvitationsController = async (req: Request, res: Response) => {
    try {
        const invitations = await getMyPendingInvitationsService(req.user!.userId);
        return res.status(200).json({ success: true, data: invitations });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const declineInvitationController = async (req: Request, res: Response) => {
    try {
        const { token } = declineInvitationSchema.parse(req.body);
        const result = await declineInvitationService(token, req.user!.userId);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return sendError(res, error, 400);
    }
};
