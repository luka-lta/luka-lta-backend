import {z} from "zod";

const permissionSchema = z.object({
    permissionId: z.number(),
    name: z.string(),
    description: z.string(),
})

export const ApiKeySchema = z.object({
    id: z.number(),
    origin: z.string().url(),
    createdBy: z.number(),
    createdAt: z.string(),
    expiresAt: z.string().nullable().optional(),
    apiKey: z.string(),
    permissions: z.array(permissionSchema).optional().default([]),
});

export type ApiKeyTypeSchema = z.infer<typeof ApiKeySchema>;

export const apiKeyListSchema = z.object({
    apiKeys: z.array(ApiKeySchema),
    totalPages: z.number().default(999),
});