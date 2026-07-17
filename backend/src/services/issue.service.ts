import { creatIssue, getNextIssueNumber, getProjectIssues, findIssueById, updateIssue, changeIssueStatus, assignIssue, changeIssuePriority, updateIssueSprint, updateIssueEpic, touchLastActivity } from "../repositories/issue.repository.js";
import { deleteIssue, type CreateIssueData } from "../repositories/issue.repository.js"
import type { AssignIssueInput, ChangIssuePriorityInput, ChangIssueStatusInput, CreateIssueInput, UpdateIssueInput, UpdateIssueSprintInput } from "../validatons/issue.validation.js";
import { findProjectById, findProjectMember } from "../repositories/project.repository.js";
import { findUserById } from "../repositories/auth.repository.js";
import { findSprintById } from "../repositories/sprint.repository.js";
import { createActivityLogService } from "./activityLog.service.js";
import { ActivityActionType, NotificationType } from "@prisma/client";
import { findEpicById } from "../repositories/epic.repository.js";
import { createNotificationService } from "./notification.service.js";



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

    const nextNumber = await getNextIssueNumber(projectId, project.project_key);
    const issueKey = `${project.project_key}-${nextNumber}`;

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
    const issue = await creatIssue(issueData);

    await createActivityLogService({
        user_id: reporterMember.user_id,
        project_id: project.project_id,
        issue_id: issue.issue_id,
        action_type: ActivityActionType.ISSUE_CREATED,
    })
    return issue;
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

    if (
        data.issue_name === undefined &&
        data.issue_description === undefined &&
        data.issue_type === undefined &&
        data.due_date === undefined &&
        data.estimate === undefined
    ) {
        throw new Error("No fields provided for update");
    }

    const dueChanged = data.due_date !== undefined && (data.due_date === null ? issue.due_date !== null : new Date(data.due_date).getTime() !== issue.due_date?.getTime());
    const estimateChanged = data.estimate !== undefined && data.estimate !== issue.estimate;

    const update = await updateIssue(issueId, data);
    if (
        data.issue_name !== undefined &&
        data.issue_name !== issue.issue_name
    ) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: issue.project_id,
            issue_id: issue.issue_id,
            action_type: ActivityActionType.ISSUE_UPDATED,
            field_name: "issue_name",
            old_value: issue.issue_name,
            new_value: data.issue_name,
        });
    }

    if (
        data.issue_description !== undefined &&
        data.issue_description !== issue.issue_description
    ) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: issue.project_id,
            issue_id: issue.issue_id,
            action_type: ActivityActionType.ISSUE_UPDATED,
            field_name: "issue_description",
            old_value: issue.issue_description ?? undefined,
            new_value: data.issue_description,
        });
    }

    if (
        data.issue_type !== undefined &&
        data.issue_type !== issue.issue_type
    ) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: issue.project_id,
            issue_id: issue.issue_id,
            action_type: ActivityActionType.ISSUE_UPDATED,
            field_name: "issue_type",
            old_value: issue.issue_type,
            new_value: data.issue_type,
        });
    }

    if (dueChanged) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: issue.project_id,
            issue_id: issue.issue_id,
            action_type: ActivityActionType.ISSUE_UPDATED,
            field_name: "due_date",
            old_value: issue.due_date?.toISOString(),
            new_value: data.due_date ?? undefined,
        });
    }

    if (estimateChanged) {
        await createActivityLogService({
            user_id: currentUserId,
            project_id: issue.project_id,
            issue_id: issue.issue_id,
            action_type: ActivityActionType.ISSUE_UPDATED,
            field_name: "estimate",
            old_value: issue.estimate != null ? String(issue.estimate) : undefined,
            new_value: data.estimate != null ? String(data.estimate) : undefined,
        });
    }
    await touchLastActivity(issueId);

    return update;
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
    await createActivityLogService({
        user_id: currentUserId,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        action_type: ActivityActionType.ISSUE_DELETED,
    });

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
    const updateStatus = await changeIssueStatus(issueId, data.issue_status);

    await touchLastActivity(issueId)

    await createActivityLogService({
        user_id: currentUserId,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        action_type: ActivityActionType.STATUS_CHANGED,
        field_name: "issue_status",
        old_value: issue.issue_status,
        new_value: data.issue_status,
    });



    return updateStatus;
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

    if (data.assignee_id === null) {
        if (issue.assignee_id === null) {
            throw new Error("Issue is already unassigned");
        }
        const unassigned = await assignIssue(issue.issue_id, null);
        await touchLastActivity(issueId);
        await createActivityLogService({
            user_id: currentUserId,
            project_id: issue.project_id,
            issue_id: issue.issue_id,
            action_type: ActivityActionType.ISSUE_ASSIGNED,
            field_name: "assignee_id",
            old_value: issue.assignee_id.toString(),

        });

        return unassigned;
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
    const assigned = await assignIssue(issueId, data.assignee_id);

    await touchLastActivity(issueId)

    await createNotificationService(
        data.assignee_id,
        currentUserId,
        NotificationType.issue_assigned,
        "You were assigned to an issue",
        `Issue #${issue.issue_id} has been assigned to you`,
        issue.issue_id,
        issue.project_id
    );

    await createActivityLogService({
        user_id: currentUserId,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        action_type: ActivityActionType.ISSUE_ASSIGNED,
        field_name: "assignee_id",
        old_value: issue.assignee_id?.toString(),
        new_value: data.assignee_id.toString(),
    });


    return assigned;
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
    const updated = await changeIssuePriority(issueId, data.issue_priority);

    await touchLastActivity(issueId)

    await createActivityLogService({
        user_id: currentUserId,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        action_type: ActivityActionType.PRIORITY_CHANGED,
        field_name: "issue_priority",
        old_value: issue.issue_priority,
        new_value: data.issue_priority,
    });



    return updated;
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

    if (currentMember.role !== "admin") {
        throw new Error("Only admin can update issue in sprint");
    }

    if (sprint_id === null) {
        if (issue.sprint_id === null) {
            throw new Error("Issue is not assigned any sprint");
        }

        const removed = await updateIssueSprint(issueId, null);
        await touchLastActivity(issueId);
        return removed;
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

    const updated = await updateIssueSprint(issueId, sprint_id);

    await touchLastActivity(issueId)

    await createActivityLogService({
        user_id: currentUserId,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        sprint_id,
        action_type: ActivityActionType.ISSUE_MOVED_TO_SPRINT,
        field_name: "sprint_id",
        old_value: issue.sprint_id?.toString(),
        new_value: sprint_id?.toString(),
    });

    return updated;
}

export const updateIssueEpicService = async (issueId: number, epicId: number | null, currentUserId: number) => {

    const issue = await findIssueById(issueId);

    if (!issue) {
        throw new Error("Issue not found");
    }

    const isMember = await findProjectMember(issue.project_id, currentUserId);

    if (!isMember) {
        throw new Error("You are not a member of this project");
    }


    let epic = null;



    if (epicId !== null) {

        epic = await findEpicById(epicId);


        if (!epic) {
            throw new Error("Epic not found");
        }

        if (epic.project_id !== issue.project_id) {
            throw new Error("Epic does not belong to this project");
        }
    }

    const updatedIssue = await updateIssueEpic(issueId, epicId);

    await createActivityLogService({
        user_id: currentUserId,
        project_id: issue.project_id,
        issue_id: issue.issue_id,
        action_type: ActivityActionType.ISSUE_MOVED_TO_EPIC,
        field_name: "epic_id",
        old_value: issue.epic_id?.toString(),
        new_value: epicId?.toString(),
    });

    return updatedIssue;
};


