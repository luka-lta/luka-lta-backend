import {z} from "zod";
import {LinkItemSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";

export const linkDetailSchema = z.object({
    link: LinkItemSchema
})

export const LinkDetailEditSchema = z.object({
    displayname: z.string(),
    url: z.string().url(),
    isActive: z.boolean(),
});

export type LinkDetailEditTypeSchema = z.infer<typeof LinkDetailEditSchema>