import {z} from 'zod'

export const createAttachmentSchema = z.object({
    attachment_type: z.enum(["image","link", "file"]),
    file_name: z
       .string()
       .trim()
       .min(1, "Name is required")
       .max(255),
    file_url: z
       .string()
       .trim()
       .url("Invalid URL"),
});
export type CreateAttrachmentInput = z.infer<typeof createAttachmentSchema>;