import type { SprintStatus } from "@prisma/client";
import prisma from "../lib/prisma.js";
import type { UpdateSprintInput } from "../validatons/sprint.validation.js";

export type createSprintData = {
    sprint_name: string,
    description?: string,
    start_date?: Date,
    end_date?: Date,
    project_id: number,
    created_by: number,
    sprint_status: SprintStatus
}

export const createSprint = async (data: createSprintData) => {
    return prisma.sprint.create({
        data,
    })
}

export const findSprintByName = async (projectId: number, sprintName: string) => {
    return prisma.sprint.findUnique({
        where: {
            project_id_sprint_name: {
                project_id: projectId,
                sprint_name: sprintName,
            }
        }
    })
}

export const findSprintById = async (sprintId: number) => {
    return prisma.sprint.findUnique({
        where: {
            sprint_id: sprintId,
        }
    }
    )
}

export const getProjectSprints = async (projectId: number) => {
    return prisma.sprint.findMany({
        where: {
            project_id: projectId,
        },
        orderBy: {
            sprint_created_at: "desc",
        }
    }
    )
}



export const updateSprint = async (sprintId: number, data: UpdateSprintInput) => {
    const updateData = {

        ...(data.sprint_name !== undefined && {
            sprint_name: data.sprint_name,
        }),

        ...(data.description !== undefined && {
            description: data.description,
        }),

        ...(data.start_date !== undefined && {
            start_date: data.start_date,
        }),

        ...(data.end_date !== undefined && {
            end_date: data.end_date,
        }),
    };

    return prisma.sprint.update({
        where: {
            sprint_id: sprintId,
        },
        data: updateData
    })
}

export const updateSprintStatus = async (sprintId: number, sprintStatus: SprintStatus) => {
    return prisma.sprint.update({
        where: {
            sprint_id: sprintId,
        },
        data: {
            sprint_status: sprintStatus,
        }
    })
}


export const getSprintIssues = async (sprintId: number) => {
    return prisma.issue.findMany({
        where: {
            sprint_id: sprintId
        },

        include: {
            reporter: {
                select: {
                    user_id: true,
                    user_name: true,
                }

            },

            assignee: {
                select: {
                    user_id: true,
                    user_name: true,
                }
            }
        }
    })
}