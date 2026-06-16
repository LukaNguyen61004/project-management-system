import { SprintStatus } from "@prisma/client";
import z from "zod";

export const createSprintSchema = z.object({
    sprint_name: z
        .string()
        .min(3)
        .max(100),

    description: z
        .string()
        .max(500)
        .optional(),

    start_date: z
        .string()
        .datetime()
        .optional(),

    end_date: z
        .string()
        .datetime()
        .optional(),
})

export type CreateSprintInput = z.infer<typeof createSprintSchema>;

export const updateSprintSchema = z.object({
    sprint_name: z
        .string()
        .min(3)
        .max(100)
        .optional(),
    
    description: z
        .string()
        .max(500)
        .optional(),

    start_date: z
        .string()
        .datetime()
        .optional(),

    end_date: z
        .string()
        .datetime()
        .optional(),
})

export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;

export const changeSprintStatusSchema = z.object({
    sprint_status: z.nativeEnum(SprintStatus)
})

export type changeSprintStatus = z.infer<typeof changeSprintStatusSchema>;