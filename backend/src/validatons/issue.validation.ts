import { optional, z } from "zod"
import { IssuePriority, IssueType } from "@prisma/client";

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