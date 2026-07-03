import {z} from 'zod';

export const registerSchema= z.object({
    user_email: z.email("Invalid email"), //z.email(): kiem tra dung format email
    user_password: z
       .string()
       .min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
    user_email:z.email("Invalid email"),
    user_password: z
       .string()
       .min(8, "Password must be at least 8 characters"),
}
)

export const googleLoginSchema = z.object({
    idToken : z.string(),
});

export const updateProfileSchema = z.object({
    user_name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50)
        .optional(),
    user_avatar_url: z
        .string()
        .trim()
        .url("Invalid avatar URL")
        .optional()
        .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

