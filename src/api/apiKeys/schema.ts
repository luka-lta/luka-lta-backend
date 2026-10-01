import { z } from "zod";

export const PermissionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
});

export const ApiKeySchema = z.object({
    id: z.number(),
    label: z.string(),
    origin: z.string(),
    keyPreview: z.string(),
    permissions: z.array(PermissionSchema),
    createdBy: z.number(),
    createdAt: z.string(),
    expiresAt: z.string().nullable(),
});

export const apiKeyListSchema = z.object({ apiKeys: z.array(ApiKeySchema) });
export const permissionListSchema = z.object({ permissions: z.array(PermissionSchema) });
export const apiKeyCreatedSchema = z.object({ apiKey: ApiKeySchema, plainKey: z.string() });

export type PermissionType = z.infer<typeof PermissionSchema>;
export type ApiKeyType = z.infer<typeof ApiKeySchema>;
