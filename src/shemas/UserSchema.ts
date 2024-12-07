import {z} from 'zod';

export  const UserSchema = z.object({
    userId: z.number(),
    email: z.string().email(),
    avatarUrl: z.string().optional().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().optional().nullable(),
});

export const UserFormSchema = z.object({
    email: UserSchema.shape.email,
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type User = z.infer<typeof UserSchema>;