import {z} from "zod";

export const accessTokenSchema = z.object({
    token: z.string().max(6),
    maxUse: z.number(),
    used: z.number(),
    isActive: z.boolean(),
    createdBy: z.number(),
    createdAt: z.string(),
})

export const acccessTokenListSchema = z.object({
    tokens: z.array(accessTokenSchema),
    totalPages: z.number().default(999)
})

export type AccessTokenTypeSchema = z.infer<typeof accessTokenSchema>;
