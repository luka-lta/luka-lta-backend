import {z} from "zod";

export const UserSchema = z.object({
    userId: z.number(),
    email: z.string().email(),
    avatarUrl: z.string().optional().nullable(),
    createdAt: z.string(),
    updatedAt: z.string().optional().nullable(),
});

export type UserTypeSchema = z.infer<typeof UserSchema>;

export const userListSchema = z.object({
    users: z.array(UserSchema),
    totalPages: z.number().default(999),
});