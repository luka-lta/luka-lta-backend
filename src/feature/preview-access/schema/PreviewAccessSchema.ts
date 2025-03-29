import {z} from "zod";
import {UserSchema} from "@/feature/user/schema/UserSchema.ts";

export const accessTokenSchema = z.object({
    token: z.string().max(6),
    maxUse: z.number(),
    used: z.number(),
    isActive: z.boolean(),
    createdBy: UserSchema,
    createdAt: z.string(),
})

export const accessTokenListSchema = z.object({
    tokens: z.array(accessTokenSchema),
    totalPages: z.number().default(999)
})

export type AccessTokenTypeSchema = z.infer<typeof accessTokenSchema>;
