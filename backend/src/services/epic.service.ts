import { ActivityActionType, type Prisma } from "@prisma/client";
import { createEpic, deleteEpic, findEpicById, findProjectEpics, getDuplicateEpicName, getEpicByName, updateEpic } from "../repositories/epic.repository.js";
import { findProjectById, findProjectMember } from "../repositories/project.repository.js";
import type { CreateEpicInput, UpdateEpicInput } from "../validations/epic.validation.js";
import { createActivityLogService } from "./activityLog.service.js";


export const createEpicService = async (projectId: number, userId: number, data: CreateEpicInput) => {

    const project = await findProjectById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    const member = await findProjectMember(projectId, userId);
    if (!member) {
        throw new Error("You are not a member of this project");
    }


    const duplicate = await getEpicByName(projectId, data.epic_name);

    if (duplicate) {
        throw new Error("Epic name already exists");
    }

    const createData: Prisma.EpicUncheckedCreateInput = {
        project_id: projectId,
        created_by: userId,
        epic_name: data.epic_name,
        epic_description: data.epic_description ?? null,
    };

    if (data.epic_color) {
        createData.epic_color = data.epic_color;
    }

    const epic = await createEpic(createData);
    await createActivityLogService({
        user_id: userId,
        project_id: projectId,
        epic_id: epic.epic_id,
        action_type: ActivityActionType.EPIC_CREATED,
        new_value: epic.epic_name,
    });

    return epic;
};

export const getProjectEpicsService = async (projectId: number, userId: number) => {

    const project = await findProjectById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    const member = await findProjectMember(projectId, userId);
    if (!member) {
        throw new Error("You are not a member of this project");
    }


    return findProjectEpics(projectId);
};

export const getEpicDetailService = async (epicId: number, userId: number) => {

    const epic = await findEpicById(epicId);

    if (!epic) {
        throw new Error("Epic not found");
    }
    const member = await findProjectMember(epic.project_id, userId);
    if (!member) {
        throw new Error("You are not a member of this project");
    }


    return epic;
};

export const updateEpicService = async (epicId: number, userId: number, data: UpdateEpicInput) => {

    const epic = await findEpicById(epicId);

    if (!epic) {
        throw new Error("Epic not found");
    }

    await findProjectMember(epic.project_id, userId);

    if (data.epic_name && data.epic_name !== epic.epic_name) {

        const duplicate = await getDuplicateEpicName(
            epic.project_id,
            data.epic_name,
            epicId
        );

        if (duplicate) {
            throw new Error("Epic name already exists");
        }
    }


    const updateData: Prisma.EpicUncheckedUpdateInput = {};

    if (data.epic_name !== undefined) {
        updateData.epic_name = data.epic_name;
    }

    if (data.epic_description !== undefined) {
        updateData.epic_description = data.epic_description;
    }

    if (data.epic_color !== undefined) {
        updateData.epic_color = data.epic_color;
    }

    const updatedEpic = await updateEpic(epicId, updateData);

    if (data.epic_name && data.epic_name !== epic.epic_name) {
        await createActivityLogService({
            user_id: userId,
            project_id: epic.project_id,
            epic_id: epic.epic_id,
            action_type: ActivityActionType.EPIC_UPDATED,
            field_name: "epic_name",
            old_value: epic.epic_name,
            new_value: data.epic_name,
        });
    }

    if (data.epic_description !== undefined && data.epic_description !== epic.epic_description) {
        await createActivityLogService({
            user_id: userId,
            project_id: epic.project_id,
            epic_id: epic.epic_id,
            action_type: ActivityActionType.EPIC_UPDATED,
            field_name: "epic_description",
            old_value: epic.epic_description ?? undefined,
            new_value: data.epic_description ?? undefined,
        });
    }

    if (data.epic_color && data.epic_color !== epic.epic_color) {
        await createActivityLogService({
            user_id: userId,
            project_id: epic.project_id,
            epic_id: epic.epic_id,
            action_type: ActivityActionType.EPIC_UPDATED,
            field_name: "epic_color",
            old_value: epic.epic_color,
            new_value: data.epic_color,
        });
    }

    return updatedEpic;
};

export const deleteEpicService = async (epicId: number, userId: number) => {

    const epic = await findEpicById(epicId);

    if (!epic) {
        throw new Error("Epic not found");
    }

    await findProjectMember(epic.project_id, userId);

    await createActivityLogService({
        user_id: userId,
        project_id: epic.project_id,
        epic_id: epic.epic_id,
        action_type: ActivityActionType.EPIC_DELETED,
        old_value: epic.epic_name,
    });

    await deleteEpic(epicId);
};
