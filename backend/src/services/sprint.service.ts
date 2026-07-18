
import { ActivityActionType, NotificationType, SprintStatus } from "@prisma/client";
import { findProjectById, findProjectMember } from "../repositories/project.repository.js";
import { createSprint, findSprintById, findSprintByName, getProjectSprints, getSprintIssues, updateSprint, updateSprintStatus, type createSprintData } from "../repositories/sprint.repository.js";
import type { changeSprintStatus, CreateSprintInput, UpdateSprintInput } from "../validations/sprint.validation.js";
import { createActivityLogService } from "./activityLog.service.js";
import { notifyProjectMembers } from "../helper/notification.helper.js";

const ALLOWED_TRANSITIONS: Record<SprintStatus, SprintStatus[]> = {
    planned: [SprintStatus.active],
    active: [SprintStatus.completed],
    completed: [],
};

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
    const newSprint = await createSprint(sprintData);

    await createActivityLogService({
        user_id: currentUserId,
        project_id: projectId,
        sprint_id: newSprint.sprint_id,
        action_type: ActivityActionType.SPRINT_CREATED,
    });

    return newSprint;
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

    const startChanged =
        data.start_date !== undefined &&
        new Date(data.start_date).getTime() !== sprint.start_date?.getTime();

    const endChanged =
        data.end_date !== undefined &&
        new Date(data.end_date).getTime() !== sprint.end_date?.getTime();

    const startRescheduled =
        data.start_date !== undefined &&
        sprint.start_date != null &&
        new Date(data.start_date).getTime() !== sprint.start_date.getTime();
    const endRescheduled =
        data.end_date !== undefined &&
        sprint.end_date != null &&
        new Date(data.end_date).getTime() !== sprint.end_date.getTime();

    if ((startRescheduled || endRescheduled) && !data.reason?.trim()) {
        throw new Error("Reason is required when changing sprint dates");
    }

    const updatedSprint = await updateSprint(sprintId, data);



    if (data.sprint_name !== undefined && data.sprint_name !== sprint.sprint_name) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: sprint.project_id,
            sprint_id: sprintId,
            action_type: ActivityActionType.SPRINT_UPDATED,
            field_name: "sprint_name",
            old_value: sprint.sprint_name,
            new_value: data.sprint_name,
        });
    }

    if (data.description !== undefined && data.description !== sprint.description) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: sprint.project_id,
            sprint_id: sprintId,
            action_type: ActivityActionType.SPRINT_UPDATED,
            field_name: "description",
            old_value: sprint.description ?? "",
            new_value: data.description ?? "",
        });
    }

    if (startChanged) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: sprint.project_id,
            sprint_id: sprintId,
            action_type: ActivityActionType.SPRINT_UPDATED,
            field_name: "start_date",
            old_value: sprint.start_date?.toISOString(),
            new_value: data.start_date,
            reason: data.reason,
        });
    }

    if (endChanged) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: sprint.project_id,
            sprint_id: sprintId,
            action_type: ActivityActionType.SPRINT_UPDATED,
            field_name: "end_date",
            old_value: sprint.end_date?.toISOString(),
            new_value: data.end_date,
            reason: data.reason,
        });
    }

    return updatedSprint;
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


    if (!ALLOWED_TRANSITIONS[sprint.sprint_status].includes(status.sprint_status)) {
        throw new Error("Invalid sprint status transition");
    }

    const updatedSprint = await updateSprintStatus(sprintId, status.sprint_status);


    await createActivityLogService({
        user_id: currentUserId,
        project_id: sprint.project_id,
        sprint_id: sprintId,
        action_type: ActivityActionType.SPRINT_STATUS_CHANGED,
        field_name: "sprint_status",
        old_value: sprint.sprint_status,
        new_value: status.sprint_status,
    });

    await notifyProjectMembers(
        sprint.project_id,
        currentUserId,
        status.sprint_status === "active"
            ? NotificationType.sprint_started
            : NotificationType.sprint_completed,
        status.sprint_status === "active"
            ? "Sprint started"
            : "Sprint completed",
        status.sprint_status === "active"
            ? `Sprint #${sprintId} has started`
            : `Sprint #${sprintId} has been completed`,
        undefined,
        sprintId
    );

    return updatedSprint
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