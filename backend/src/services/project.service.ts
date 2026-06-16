import { v4 as uuidv4 } from "uuid"
import {
    findProjectByKey, createProjectWithAdmin, getUserProjects, findProjectMember,
    findProjectMembership, findPendingInvitation, creatInvitation, acceptInvitation,
    findInvitationByToken, createProjectMembership, getProjectMembers, findProjectById,
    removeProjectMember, updateProject,
    deleteProject
} from "../repositories/project.repository.js";
import  type {UpdateProjectInput} from "../validatons/project.validation.js"
import { findUserByEmail, findUserById } from "../repositories/auth.repository.js";



export const createProjectService = async (userId: number, project_name: string, project_key: string, project_description?: string) => {
    const existingProject = await findProjectByKey(project_key);

    if (existingProject) {
        throw new Error("Project key already exists")
    }

    const project = await createProjectWithAdmin(userId, project_name, project_key, project_description);

    return project;
}

export const getUserProjectsServices = async (userId: number) => {
    const membership = await getUserProjects(userId);

    return membership.map((membership) => ({
        ...membership.project,
        role: membership.role,
        joined_at: membership.joined_at,

    }));
}

export const getProjectDetailService = async (projectId: number, userId: number) => {
    const membership = await findProjectMember(projectId, userId);

    if (!membership) {
        throw new Error("Project not found or access denied");
    }

    return {
        ...membership.project,
        current_user_role: membership.role
    };
}

export const inviteMemberService = async (projectId: number, currentUserId: number, email: string) => {


    const existingInvitation = await findPendingInvitation(projectId, email);

    if (existingInvitation) { throw new Error("Invitation already sent"); }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        const existingMembership = await findProjectMembership(projectId, existingUser.user_id);

        if (existingMembership) {
            throw new Error("User already in project");
        };
    }

    const token = uuidv4();

    const invitation = await creatInvitation(projectId, email, token, currentUserId);

    return invitation
}

export const acceptInvitationService = async (token: string, currentUserId: number) => {
    const currentUser = await findUserById(currentUserId);

    if (!currentUser) {
        throw new Error("User not found");
    }

    const invitation = await findInvitationByToken(token);

    if (!invitation) {
        throw new Error("Invitaion not found");
    }

    if (invitation.accepted_at) {
        throw new Error("Invitation already accepted");
    }

    if (invitation.expires_at < new Date()) {
        throw new Error("Invitation expired");
    }

    if (
        invitation.email !==
        currentUser.user_email
    ) {
        throw new Error(
            "This invitation is not for your account"
        );
    }

    const existingMembership = await findProjectMembership(invitation.project_id, currentUserId);

    if (existingMembership) {
        throw new Error(
            "Already joined project"
        );
    }

    await createProjectMembership(
        invitation.project_id,
        currentUserId,
        invitation.role_member
    );

    await acceptInvitation(
        invitation.invitation_id
    );

    return {
        message: "Invitation accepted",
        project: invitation.project,
    };
}

export const getProjectMembersService = async (projectId: number) => {
    return getProjectMembers(projectId);
}

export const removeProjectMembersService = async (projectId: number, currentUserId: number, targetUserId: number) => {
    if (targetUserId === currentUserId) {
        throw new Error(" Use leave project instead");
    }

    const project = await findProjectById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    const targetUser = await findProjectMembership(projectId, targetUserId);

    if (!targetUser) {
        throw new Error("User is not a project member");
    }


    if (project.owner_id === targetUserId) {
        throw new Error(" Cannot remove project owner");
    }

    await removeProjectMember(projectId, targetUserId);

    return {
        message:"Member removed successfully"
    }
}

export const leaveProjectService = async (projectId: number, currentUserId: number) =>{
     const project = await findProjectById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

     if (project.owner_id === currentUserId) {
        throw new Error(" project owner cannot leave");
    }

    await removeProjectMember(projectId, currentUserId);

    return {
        message:"Left project successfully"
    }
}

export const updateProjectService = async (projectId: number, data:UpdateProjectInput )=>{
    const updatedProject =await updateProject( projectId, data );

    return updatedProject;
}

export const deleteProjectService= async(projectId: number, currentUserId: number)=> {
    const project = await findProjectById(projectId);

    if(!project){
        throw new Error("Project not found");
    }

    if(project.owner_id !== currentUserId) {
        throw new Error("Only project owner can delete");
    }
    
    await deleteProject(projectId);

    return { message: "Project deleted successfully"};
}




