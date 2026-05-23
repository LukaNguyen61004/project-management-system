import {z} from 'zod';

export const registerschema= z.object({
    user_email: z.email("Invalid email"), //z.email(): kiem tra dung format email
    user_password: z
       .string()
       .min(8, "Password must be at least 8 characters"),
});


