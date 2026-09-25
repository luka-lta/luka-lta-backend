import {z} from "zod";
import {LinkItemSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";

export const linkDetailSchema = z.object({
    link: LinkItemSchema
})

export const LinkDetailEditSchema = z.object({
    displayname: z.string().nonempty().min(1).max(255),
    description: z.string().nullable().default(null).transform((v) => (v ? v : null)),
    url: z.string().url(),
    isActive: z.boolean(),
    iconName: z.string().nullable().default(null).transform((v) => (v ? v : null)),
});

export type LinkDetailEditTypeSchema = z.infer<typeof LinkDetailEditSchema>