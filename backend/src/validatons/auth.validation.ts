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


