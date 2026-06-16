import { creatIssue, countProjectIssues, getProjectIssues, findIssueById, updateIssue, changeIssueStatus, assignIssue, changeIssuePriority, updateIssueSprint } from "../repositories/issue.repository.js";
import { deleteIssue, type CreateIssueData } from "../repositories/issue.repository.js"
import type { AssignIssueInput, ChangIssuePriorityInput, ChangIssueStatusInput, CreateIssueInput, UpdateIssueInput, UpdateIssueSprintInput } from "../validatons/issue.validation.js";
import { findProjectById, findProjectMember } from "../repositories/project.repository.js";
import { findUserById } from "../repositories/auth.repository.js";
import { findSprintById } from "../repositories/sprint.repository.js";


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

    return { message: "Issue deleted successfully" };
}

export const changeIssueStatusService = async (issueId: number, data: ChangIssueStatusInput, currentUserId: number) => {
    const issue = await findIssueById(issueId);

    if (!issue) {
        throw new Error("Issue not found");
    }

    const currentUser = await findProjectMember(issue.project_id, currentUserId);

    if (!currentUser) {
        throw new Error("You are not a member of this project");
    }

    if (issue.issue_status === data.issue_status) {
        throw new Error("Issue already has this status");
    }

    return changeIssueStatus(issueId, data.issue_status);
}

export const assignIssueService = async (issueId: number, data: AssignIssueInput, currentUserId: number) => {
    const issue = await findIssueById(issueId);

    if (!issue) {
        throw new Error("Issue not found");
    }

    const currentMember = await findProjectMember(issue.project_id, currentUserId);

    if (!currentMember) {
        throw new Error("You are not a member of this project");
    }

    const assignee = await findUserById(data.assignee_id);

    if (!assignee) {
        throw new Error("User not found");
    }

    const projectMember = await findProjectMember(issue.project_id, data.assignee_id);

    if (!projectMember) {
        throw new Error("User is not a member of this project");
    }

    if (issue.assignee_id === data.assignee_id) {
        throw new Error("Issue already assigned to this user")
    }

    return assignIssue(issueId, data.assignee_id);
}

export const changeIssuePriorityService = async (issueId: number, data: ChangIssuePriorityInput, currentUserId: number) => {
    const issue = await findIssueById(issueId);

    if (!issue) {
        throw new Error("Issue not found");
    }

    const currentMember = await findProjectMember(issue.project_id, currentUserId);

    if (!currentMember) {
        throw new Error("You are not a member of this project");
    }

    if (issue.issue_priority === data.issue_priority) {
        throw new Error("Issue already had the same priority");
    }

    return changeIssuePriority(issueId, data.issue_priority);
}

export const updateIssueSprintService = async (issueId: number, currentUserId: number, data: UpdateIssueSprintInput) => {
    const { sprint_id } = data;

    const issue = await findIssueById(issueId);
    if (!issue) {
        throw new Error("Issue not found");
    }
    const currentMember = await findProjectMember(issue.project_id, currentUserId);
    if (!currentMember) {
        throw new Error("You are not a member of this project");
    }

    if(currentMember.role !== "admin"){
        throw new Error("Only admin can update issue in sprint");
    }

    if (sprint_id === null) {
        if (issue.sprint_id === null) {
            throw new Error ("Issue is not assigned any sprint");
        }

        return updateIssueSprint(issueId, null);
    }

    const sprint = await findSprintById(sprint_id);
    if (!sprint) {
        throw new Error("Sprint not found");
    }

    if (sprint.project_id !== issue.project_id) {
        throw new Error("Issue and sprint aren't in the same project")
    }

    if (issue.sprint_id === sprint_id) {
        throw new Error("Issue is already moved to this sprint");
    }

    return await updateIssueSprint(issueId, sprint_id);
}