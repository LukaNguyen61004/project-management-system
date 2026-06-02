import { creatIssue, countProjectIssues, getProjectIssues, findIssueById, updateIssue } from "../repositories/issue.repository.js";
import { deleteIssue, type CreateIssueData } from "../repositories/issue.repository.js"
import type { CreateIssueInput, UpdateIssueInput } from "../validatons/issue.validation.js";
import { findProjectById, findProjectMember } from "../repositories/project.repository.js";


export const createIssueService = async (projectId: number, reporterId: number, data: CreateIssueInput) => {
    const project = await findProjectById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    const reporterMember = await findProjectMember(projectId, reporterId);

    if (!reporterMember) {
        throw new Error("You are not member of this project");
    }

    if (data.issue_assignee !== undefined) {
        const assigneeMember = await findProjectMember(projectId, data.issue_assignee);

        if (!assigneeMember) {
            throw new Error("Assignee is not a member of this project");
        }
    }

    const isseCount = await countProjectIssues(projectId);

    const issueKey = `${project.project_key}-${isseCount + 1}`;

    const issueData: CreateIssueData = {
        issue_key: issueKey,
        issue_name: data.issue_name,
        issue_type: data.issue_type,

        issue_priority: data.issue_priority,

        reporter_id: reporterId,

        project_id: projectId,

        ...(data.issue_description !== undefined && {
            issue_description:
                data.issue_description,
        }),

        ...(data.issue_assignee !== undefined && {
            assignee_id:
                data.issue_assignee,
        }),
    }

    return creatIssue(issueData);
}

export const getProjectIssueService = async (projectId: number, currentUserId: number) => {
    const project = await findProjectById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    const currentUser = await findProjectMember(projectId, currentUserId);

    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }

    return getProjectIssues(projectId);
}

export const getIssueDetailService = async (issueId: number, currentUserId: number) => {
    const issue = await findIssueById(issueId);

    if (!issue) {
        throw new Error("Issue not found");
    }

    const currentUser = await findProjectMember(issue.project_id, currentUserId);
    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }

    return issue;
}

export const updateIssueService = async (issueId: number, currentUserId: number, data: UpdateIssueInput) => {
    const issue = await findIssueById(issueId);
    if (!issue) {
        throw new Error("Issue not found");
    }

    const currentUser = await findProjectMember(issue.project_id, currentUserId);

    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }

    if (data.issue_name === undefined && data.issue_description === undefined && data.issue_type === undefined) {
        throw new Error("No fields provided for update");
    }

    return updateIssue(issueId, data);
}

export const deleteIssueService = async (issueId: number, currentUserId: number) => {
    const issue = await findIssueById(issueId);
    if (!issue) {
        throw new Error("Issue not found");
    }

    const currentUser = await findProjectMember(issue.project_id, currentUserId);

    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }

    await deleteIssue(issueId);

    return {message: "Issue deleted successfully"};
}