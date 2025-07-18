import {z} from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: 'Please enter your email' })
        .email({ message: 'Invalid email address' }),
    password: z
        .string()
        .min(1, {
            message: 'Please enter your password',
        })
        .min(8, {
            message: 'Password must be at least 8 characters long',
        }),
})

export type LoginSchema = z.infer<typeof loginSchema>;