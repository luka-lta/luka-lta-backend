import {z} from 'zod';

const permissionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
})

export const ApiKeySchema = z.object({
    id: z.number(),
    origin: z.string(),
    createdBy: z.number(),
    createdAt: z.date(),
    expiresAt: z.date().nullable().optional(),
    apiKey: z.string(),
    permissions: z.array(permissionSchema).optional().default([]),
});


export const ApiKeyFormSchema = z.object({
    origin: ApiKeySchema.shape.origin,
    expiresAt: ApiKeySchema.shape.expiresAt,
    permissions: ApiKeySchema.shape.permissions,
});

export type ApiKeyTypeSchema = z.infer<typeof ApiKeySchema>;