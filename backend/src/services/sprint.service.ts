
import { SprintStatus } from "@prisma/client";
import { findProjectById, findProjectMember } from "../repositories/project.repository.js";
import { createSprint, findSprintById, findSprintByName, getProjectSprints, getSprintIssues, updateSprint, updateSprintStatus, type createSprintData } from "../repositories/sprint.repository.js";
import type { changeSprintStatus, CreateSprintInput, UpdateSprintInput } from "../validatons/sprint.validation.js";



export const createSprintService = async (projectId: number, currentUserId: number, data: CreateSprintInput) => {
    const project = await findProjectById(projectId);


    if (!project) {
        throw new Error("Project not found");
    }

    const currentMember = await findProjectMember(projectId, currentUserId);
    if (!currentMember) {
        throw new Error(" You are not member of this project");
    }

    const sprint = await findSprintByName(projectId, data.sprint_name);

    if (sprint) {
        throw new Error("Sprint name duplicated");
    }

    const startDate = data.start_date ? new Date(data.start_date) : undefined;

    const endDate = data.end_date ? new Date(data.end_date) : undefined;

    if (startDate && endDate) {
        if (startDate > endDate) {
            throw new Error("End date must be after start date");
        }
    }

    const sprintData: createSprintData = {
        sprint_name: data.sprint_name,

        project_id: projectId,

        created_by: currentUserId,

        sprint_status: SprintStatus.planned,

        ...(data.description !== undefined && {
            description: data.description,
        }),

        ...(data.start_date !== undefined && {
            start_date: new Date(data.start_date),
        }),

        ...(data.end_date !== undefined && {
            end_date: new Date(data.end_date),
        }),
    };

    return createSprint(sprintData);
}

export const getProjectSprintsService = async (projectId: number, currentUserId: number) => {
    const project = await findProjectById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    const currentMember = await findProjectMember(projectId, currentUserId);
    if (!currentMember) {
        throw new Error(" You are not member of this project");
    }

    return getProjectSprints(projectId);
}

export const getSprintDetailService = async (sprintId: number, currentUserId: number) => {
    const sprint = await findSprintById(sprintId);

    if (!sprint) {
        throw new Error("Sprint not found");
    }

    const currentMember = await findProjectMember(sprint.project_id, currentUserId);
    if (!currentMember) {
        throw new Error(" You are not member of this project");
    }

    return sprint;
}

export const updateSprintService = async (sprintId: number, currentUserId: number, data: UpdateSprintInput) => {
    const sprint = await findSprintById(sprintId);

    if (!sprint) {
        throw new Error("Sprint not found");
    }

    const currentMember = await findProjectMember(sprint.project_id, currentUserId);
    if (!currentMember) {
        throw new Error(" You are not member of this project");
    }

    if (currentMember.role !== "admin") {
        throw new Error(
            "Insufficient permissions"
        );
    }

    if (data.sprint_name) {
        const checkDuplicate = await findSprintByName(sprint.project_id, data.sprint_name);

        if (checkDuplicate && checkDuplicate.sprint_id !== sprintId) {
            throw new Error("This name is duplicated");
        }
    }

    const startDate = data.start_date ? new Date(data.start_date) : undefined;

    const endDate = data.end_date ? new Date(data.end_date) : undefined;

    if (startDate && endDate) {
        if (startDate > endDate) {
            throw new Error("End date must be after start date");
        }
    }

    return updateSprint(sprintId, data);
}

export const changeStatusSprintService = async (sprintId: number, currentUserId: number, status: changeSprintStatus) => {
    const sprint = await findSprintById(sprintId);

    if (!sprint) {
        throw new Error("Sprint not found");
    }

    const currentMember = await findProjectMember(sprint.project_id, currentUserId);
    if (!currentMember) {
        throw new Error(" You are not member of this project");
    }

    if (sprint.sprint_status === status.sprint_status) {
        throw new Error("This status does not change");
    }

    return updateSprintStatus(sprintId, status.sprint_status);
}

export const getSprintIssuesService = async (sprintId: number, currentUserId: number) => {
    const sprint = await findSprintById(sprintId);

    if (!sprint) {
        throw new Error("Sprint not found");
    }

    const currentMember = await findProjectMember(sprint.project_id, currentUserId);
    if (!currentMember) {
        throw new Error(" You are not member of this project");
    }

    return getSprintIssues(sprintId);

}