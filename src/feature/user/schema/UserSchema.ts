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

export const UserFormSchema = z.object({
    email: UserSchema.shape.email,
    password: z.string().min(8, "Password must be at least 8 characters long"),
});