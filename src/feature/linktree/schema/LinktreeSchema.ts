import {z} from "zod";

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

export type linkData = {
    displayname: string,
    description: string,
    url: string,
    isActive: boolean,
    iconName?: string,
}

export type LinkItemTypeSchema = z.infer<typeof LinkItemSchema>

export const linkListSchema = z.object({
    links: z.array(LinkItemSchema),
    totalPages: z.number().default(999),
});

