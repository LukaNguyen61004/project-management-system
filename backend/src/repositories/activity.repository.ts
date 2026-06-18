import prisma from "../lib/prisma.js"
import type { CreateActivityLog } from "../validatons/activityLog.validation.js"


export const createActivityLog =async (data: CreateActivityLog) =>{
    return prisma.activityLog.create({
        data: {
            user_id: data.user_id,
            project_id: data.project_id,

            issue_id: data.issue_id ?? null,
            sprint_id: data.sprint_id ?? null,

            action_type: data.action_type,

            field_name: data.field_name ?? null,
            old_value: data.old_value ?? null,
            new_value: data.new_value ?? null,
        },
    });
}

export const getProjectActivityLog = async(projectId: number, skip: number, take:number)=>{
    return prisma.activityLog.findMany({
        where: {
            project_id: projectId,
        },
        include: {
            user:{
                select: {
                    user_id: true,
                    user_name: true,
                    user_avatar_url: true,
                }
            },

            issue :{
                select: {
                    issue_id:true,
                    issue_name: true,
                }
            },

            sprint:{
                select :{
                    sprint_id:true,
                    sprint_name: true,
                },
            },
        },
        orderBy: {
            created_at: "desc",
        },
        skip,
        take,
    })
};

export const countProjectActivity = async(projectId: number)=>{
    return prisma.activityLog.count({
        where:{
            project_id: projectId,
        },
    });
};