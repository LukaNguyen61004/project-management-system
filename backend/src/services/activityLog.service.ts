import {  type CreateActivityLog } from "../validations/activityLog.validation.js";
import { countProjectActivity, createActivityLog, getProjectActivityLog } from "../repositories/activity.repository.js";
import { findProjectById, findProjectMembership } from "../repositories/project.repository.js";


export const createActivityLogService = async(data: CreateActivityLog)=>{
    return createActivityLog(data);
}

export const getProjectActivityLogService = async( projectId: number, currentUserId: number, page: number, limit: number)=>{
    const project= await findProjectById(projectId);
    
    if(!project){
        throw new Error("Project not found");
    }

    const currentMember = await findProjectMembership(projectId, currentUserId);

    if(!currentMember){
        throw new Error("You are not a member of this project");
    }

    const skip =(page-1) *limit;

    const [activities, total] = await Promise.all([
        getProjectActivityLog(projectId, skip, limit),
        countProjectActivity(projectId) 
    ]);

    return {activities,
            pagination:{
              page, 
              limit, 
              total,
              totalPage: Math.ceil(total/limit),
            }
    }
}