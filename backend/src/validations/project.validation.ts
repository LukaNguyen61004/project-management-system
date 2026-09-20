import { z } from "zod";

export const createProjectSchema = z.object({
   project_name: z
      .string()
      .trim()
      .min(3, "Project name must be at least 3 characters")
      .max(100, "Project name cannot exceed 100 characters"),

   project_key: z
      .string()
      .trim()
      .min(2, "Project key must be at least 2 characters")
      .max(10, "Project key cannot exceed 10 characters")
      .regex(/^[A-Z]+$/, "Project key must be uppercase letters only (A–Z)"),

   project_description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
})

export const inviteMemberSchema = z.object({
   email: z.email(),
})

export const acceptInvitationSchema = z.object({
   token: z.string().min(1),
})


export const updateProjectSchema = z.object({
   project_name: z
      .string()
      .trim()
      .min(3, "Project name must be at least 3 characters")
      .max(100, "Project name cannot exceed 100 characters")
      .optional(),

   project_description: z
      .string()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;


export const declineInvitationSchema = z.object({
   token: z.string().min(1),
})