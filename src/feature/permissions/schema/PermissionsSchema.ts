import {z} from "zod";

export const permissionSchema = z.object({
    permissionId: z.number(),
    name: z.string(),
    description: z.string(),
})

export const permissionListSchema = z.object({
    permissions: z.array(permissionSchema),
    totalPages: z.number().default(999)
})

export type PermissionsTypeSchema = z.infer<typeof permissionSchema>;
