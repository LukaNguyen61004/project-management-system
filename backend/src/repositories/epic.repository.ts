import type { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js"


export const createEpic = async ( data: Prisma.EpicUncheckedCreateInput) => {
    return prisma.epic.create({
        data,
    });
};

export const findEpicById = async (epicId: number) => {
    return prisma.epic.findUnique({
        where: {
            epic_id: epicId,
        },
        include: {
            creator: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_avatar_url: true,
                },
            },
            project: {
                select: {
                    project_id: true,
                    project_name: true,
                },
            },
        },
    });
};

export const findEpicByName = async (projectId: number, epicName: string) => {
    return prisma.epic.findFirst({
        where: {
            project_id: projectId,
            epic_name: epicName,
        },
    });
};


export const findProjectEpics = async (projectId: number) => {
    return prisma.epic.findMany({
        where: {
            project_id: projectId,
        },
        include: {
            creator: {
                select: {
                    user_name: true,
                },
            },
            _count: {
                select: {
                    issues: true,
                },
            },
        },
        orderBy: {
            epic_created_at: "desc",
        },
    });
};

export const updateEpic = async (epicId: number,data: Prisma.EpicUncheckedUpdateInput) => {
    return prisma.epic.update({
        where: {
            epic_id: epicId,
        },
        data,
    });
};

export const deleteEpic = async (epicId: number) => {
    return prisma.epic.delete({
        where: {
            epic_id: epicId,
        },
    });
};

export const getEpicByName = async (projectId: number,epicName: string) => {
    return prisma.epic.findFirst({
        where: {
            project_id: projectId,
            epic_name: epicName,
        },
    });
};

export const getDuplicateEpicName = async (projectId: number, epicName: string, epicId: number) => {
    return prisma.epic.findFirst({
        where: {
            project_id: projectId,
            epic_name: epicName,
            NOT: {
                epic_id: epicId,
            },
        },
    });
};