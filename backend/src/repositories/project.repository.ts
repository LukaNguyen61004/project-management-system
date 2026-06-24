import prisma from "../lib/prisma.js";
import type { UpdateProjectInput } from "../validatons/project.validation.js";


export const findProjectByKey = async (project_key: string) => {
    return prisma.project.findUnique({
        where: {
            project_key,
        },
    });
};

export const findProjectById = async (projectId: number) =>{
    return prisma.project.findUnique({
        where: {
            project_id: projectId,
        }
    })
}

export const createProjectWithAdmin = async (userId: number, project_name: string, project_key: string, project_description?: string) => {
    return prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                project_name,
                project_key,
                project_description: project_description ?? null,
                owner_id: userId,
            },
        });

        await tx.projectMember.create({
            data: {
                project_id: project.project_id,
                user_id: userId,
                role: "admin",
            },
        });

        return project;
    });
};

export const getUserProjects = async (userId: number) => {
    return prisma.projectMember.findMany({
        where: {
            user_id: userId,
        },
        include: {
            project: {
                include: {
                    owner: {
                        select: {
                            user_id: true,
                            user_name: true,
                            user_email: true,
                            user_avatar_url: true,
                        }
                    }
                }
            }
        },
        orderBy: {
            joined_at: "desc",
        },
    })
}

export const findProjectMember = async (projectId: number, userId: number) => {
    return prisma.projectMember.findFirst({
        where: {
            project_id: projectId,
            user_id: userId,
        },

        include: {
            project: {
                include: {
                    owner: {
                        select: {
                            user_id: true,
                            user_name: true,
                            user_email: true,
                            user_avatar_url: true,
                        },
                    },

                    members: {
                        include: {
                            user: {
                                select: {
                                    user_id: true,
                                    user_name: true,
                                    user_email: true,
                                    user_avatar_url: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};


export const findProjectMembership = async (projectId: number, userId: number) => {
    return prisma.projectMember.findFirst({
        where: {
            project_id: projectId,
            user_id: userId
        }
    })
}

export const findPendingInvitation = async (projectId: number, email: string) => {
    return prisma.projectInvitation.findFirst({
        where: {
            project_id: projectId,
            email,
            accepted_at: null,
        }
    })
}

export const creatInvitation = async (projectId: number, email: string, token: string, invitedBy: number) => {
    return prisma.projectInvitation.create({
        data: {
            project_id: projectId,
            email,
            token,
            invited_by: invitedBy,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        }
    })
}

export const findInvitationByToken = async (token: string) => {
    return prisma.projectInvitation.findUnique({
        where: {
            token,
        },

        include: {
            project: true,
        }
    })
}

export const createProjectMembership = async (projectId: number, userId: number, role: "admin" | "member") => {
    return prisma.projectMember.create({
        data: {
            project_id: projectId,
            user_id: userId,
            role,
        }
    })
}

export const acceptInvitation = async (invitationId: number) => {
    return prisma.projectInvitation.update({
        where: {
            invitation_id: invitationId,
        },
        data: {
            accepted_at: new Date(),
        },
    });
}

export const getProjectMembers = async (projectId: number) =>{
    return prisma.projectMember.findMany({
        where: {
            project_id: projectId
        },

        include :{
            user: {
                select: {
                    user_id: true,
                    user_name: true,
                    user_avatar_url: true,
                    user_email: true,
                }
            }
        }
    })
}

export const getProjectMemberIds = async (projectId: number) => {
    return prisma.projectMember.findMany({
        where: { project_id: projectId },
        select: {
            user_id: true,
        }
    });
};

export const removeProjectMember = async (projectId:number, userId: number) =>{
    return prisma.projectMember.delete({
        where:{
            project_id_user_id: {
                project_id: projectId,
                user_id:userId,
            }
        }
    })
}

export const updateProject = async (projectId: number,data: UpdateProjectInput) =>{
    const updateData = {
        ...(data.project_name !== undefined && {
            project_name: data.project_name,
        }),

        ...(data.project_description !== undefined && {
            project_description:
                data.project_description,
        }),
    };

    return prisma.project.update({
        where: {
            project_id: projectId,
        },
        data:updateData
    })
}

export const deleteProject =async (projectId: number)=>{
    return prisma.project.delete({
        where :{
            project_id:projectId,
        }
    })
}