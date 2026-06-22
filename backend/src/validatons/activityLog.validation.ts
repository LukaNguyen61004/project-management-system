import { ActivityActionType } from "@prisma/client"
import { z } from "zod"

export const createActivityLogSchema = z.object({
    user_id: z.number(),
    project_id: z.number(),
    issue_id: z
        .number()
        .optional(),

    epic_id: z
        .number()
        .optional(),

    sprint_id: z
        .number()
        .optional(),

    comment_id: z
        .number()
        .optional(),

    action_type: z.nativeEnum(ActivityActionType),

    field_name: z
        .string()
        .optional(),
    old_value: z
        .string()
        .optional(),
    new_value: z
        .string()
        .optional()
})

export type CreateActivityLog = z.infer<typeof createActivityLogSchema>

export const getProjectActivityLogSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20)
})

export type GetActivityLogInput = z.infer<typeof getProjectActivityLogSchema>