import {z} from "zod"

export const LinkItemSchema = z.object({
    id: z.number(),
    displayname: z.string().min(1, "Display name is required"),
    description: z.string().optional().nullable().default(null),
    url: z.string().url("Must be a valid URL"),
    createdOn: z.string(),
    isActive: z.boolean(),
    iconName: z.string().optional().nullable().default(null),
    displayOrder: z.number().int().nonnegative('Display order must be a positive number'),
})

export type LinkItemTypeSchema = z.infer<typeof LinkItemSchema>

export const LinkFormSchema = z.object({
    displayname: z.string().min(1, "Display name is required"),
    description: z.string().optional().nullable().default(null),
    url: z.string().url("Must be a valid URL"),
    isActive: z.boolean().default(true),
    iconName: z.string().optional().nullable().default(null),
});

