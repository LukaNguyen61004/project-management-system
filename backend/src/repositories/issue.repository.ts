import prisma from "../lib/prisma.js"
import type { CreateIssueInput, UpdateIssueInput } from "../validatons/issue.validation.js"
import { IssuePriority, IssueStatus, IssueType } from "@prisma/client"

export type CreateIssueData = {
    issue_key: string;
    issue_name: string;

    issue_type: IssueType;
    issue_priority: IssuePriority;

    project_id: number;
    reporter_id: number;

    issue_description?: string;
    assignee_id?: number;
};

export const countProjectIssues = async (project_id: number) => {
    return prisma.issue.count({
        where: {
            project_id: project_id,
        }
    })
}

export const creatIssue = async (data: CreateIssueData) => {

    return prisma.issue.create({
        data,
    })

}

export const getProjectIssues = async (projectId: number) => {
    return prisma.issue.findMany({
        where: {
            project_id: projectId,
        },

        include: {
            reporter: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_email: true,
                    user_avatar_url: true,
                }
            },

            assignee: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_email: true,
                    user_avatar_url: true,
                }
            },
            sprint: {
                select: {
                    sprint_id: true,
                    sprint_name:true,
                }
            }
        },
        orderBy: {
            issue_created_at: "desc"
        }
    })
}

export const findIssueById = async (issueId: number) => {
    return prisma.issue.findUnique({
        where: {
            issue_id: issueId,
        },

        include: {
            reporter: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_email: true,
                    user_avatar_url: true,
                }
            },

            assignee: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_email: true,
                    user_avatar_url: true,
                }
            },

            project: {
                select: {
                    project_id: true,
                    project_name: true,
                    project_key: true,
                }
            },

            sprint: {
                select :{
                    sprint_id:true, 
                    sprint_name: true,
                }
            }
        }
    })
}

export const updateIssue = async (issueId: number, data: UpdateIssueInput) => {
    const updateData = {

        ...(data.issue_name !== undefined && {
            issue_name: data.issue_name,
        }),

        ...(data.issue_description !== undefined && {
            issue_description:
                data.issue_description,
        }),

        ...(data.issue_type !== undefined && {
            issue_type: data.issue_type,
        }),
    }

    return prisma.issue.update({
        where: {
            issue_id: issueId,
        },
        data: updateData,
    })
}

export const deleteIssue = async (issueId: number) => {
    return prisma.issue.delete({
        where: {
            issue_id: issueId,
        }
    })
}


export const changeIssueStatus = async (issueId: number, status: IssueStatus) => {
    return prisma.issue.update({
        where: {
            issue_id: issueId,
        },

        data: {
            issue_status: status,
        }
    });
}

export const assignIssue = async (issueId: number, assigneeId: number) => {
    return prisma.issue.update({
        where: {
            issue_id: issueId,
        },
        data: {
            assignee_id: assigneeId,
        }
    });
}

export const changeIssuePriority = async(issue_id: number, priority: IssuePriority)=>{
   return prisma.issue.update({
    where:{
        issue_id: issue_id,

    },
    data: {
        issue_priority: priority,
    }

   })
}

export const updateIssueSprint =async (issueId: number, sprintId: number | null )=>{
     return prisma.issue.update({
        where:{
            issue_id:issueId
        }, 
        data:{
            sprint_id: sprintId
        }
     })

}
