import {z} from 'zod';

export const ApiKeySchema = z.object({
    id: z.number(),
    origin: z.string(),
    createdBy: z.number(),
    createdAt: z.date(),
    expiresAt: z.date().nullable().optional(),
    apiKey: z.string(),
});

export const ApiKeyFormSchema = z.object({
    origin: ApiKeySchema.shape.origin,
    expiresAt: ApiKeySchema.shape.expiresAt,
});

export type ApiKeyTypeSchema = z.infer<typeof ApiKeySchema>;