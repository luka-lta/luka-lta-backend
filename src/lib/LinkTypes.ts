import { z } from "zod"

export const LinkItemSchema = z.object({
    id: z.number(),
    displayname: z.string().min(1, "Display name is required"),
    description: z.string().optional(),
    url: z.string().url("Must be a valid URL"),
    createdOn: z.string(),
    isActive: z.boolean(),
    iconName: z.string().optional(),
    displayOrder: z.number(),
})

export type LinkItemType = z.infer<typeof LinkItemSchema>

