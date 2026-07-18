import { z } from "zod";

export const createEpicSchema = z.object({
    epic_name: z
        .string()
        .trim()
        .min(1, "Epic name is required")
        .max(100, "Epic name cannot exceed 100 characters"),

    epic_description: z
        .string()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional(),

    epic_color: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6})$/, "Invalid color")
        .optional(),
});

export type CreateEpicInput = z.infer<typeof createEpicSchema>;

export const updateEpicSchema = z.object({
    epic_name: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    epic_description: z
        .string()
        .max(1000)
        .optional(),

    epic_color: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6})$/)
        .optional(),
});

export type UpdateEpicInput = z.infer<typeof updateEpicSchema >;