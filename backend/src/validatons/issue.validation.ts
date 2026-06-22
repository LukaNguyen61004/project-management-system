import { z } from "zod"
import { IssuePriority, IssueStatus, IssueType } from "@prisma/client";

export const createIssueSchema = z.object({
    issue_name: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(255, "Title cannot exceed 255 characters"),

    issue_description: z
        .string()
        .optional(),

    issue_type: z
        .nativeEnum(IssueType),

    issue_priority: z
        .nativeEnum(IssuePriority),

    issue_assignee: z
        .number()
        .int()
        .positive()
        .optional()
})

export type CreateIssueInput = z.infer<typeof createIssueSchema>

export const updateIssueSchema = z.object({
    issue_name: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(255, "Title cannot exceed 255 characters")
        .optional(),

    issue_description: z
        .string()
        .optional(),

    issue_type: z
        .nativeEnum(IssueType)
        .optional(),
})
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;


export const changeIssueStatusSchema = z.object({
    issue_status: z.nativeEnum(IssueStatus),
})

export type ChangIssueStatusInput = z.infer<typeof changeIssueStatusSchema>;


export const assignIssueSchema = z.object({
    assignee_id: z
         .number()
         .int()
         .positive(),
})

export type AssignIssueInput = z.infer<typeof assignIssueSchema>;

export const changeIssuePrioritySchema = z.object({
    issue_priority: z.nativeEnum(IssuePriority),
})

export type ChangIssuePriorityInput = z.infer< typeof changeIssuePrioritySchema>;

export const updateIssueSprintSchema = z.object({
    sprint_id: z
    .number()
    .int()
    .positive()
    .nullable(),
}) 

export type UpdateIssueSprintInput = z.infer<typeof updateIssueSprintSchema>;

export const updateIssueEpicSchema = z.object({
    epic_id: z.number().nullable(),
});

export type UpdateIssueEpicInput = z.infer<typeof updateIssueEpicSchema>;

