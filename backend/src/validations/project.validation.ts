import { z } from "zod";

export const createProjectSchema = z.object({
   project_name: z
      .string()
      .min(3)
      .max(100),

   project_key: z
      .string()
      .min(2)
      .max(10)
      .regex(/^[A-Z]+$/),

   project_description: z
      .string()
      .max(500)
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
      .min(3)
      .max(100)
      .optional(),

   project_description: z
      .string()
      .max(1000)
      .optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;


export const declineInvitationSchema = z.object({
   token: z.string().min(1),
})