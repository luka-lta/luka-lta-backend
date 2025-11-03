import {z} from "zod";

export const clickSchema = z.object({
    clickId: z.number(),
    clickTag: z.string(),
    url: z.string().url(),
    clickedAt: z.string(),
    ipAddress: z.string().ip().optional().nullable(),
    market: z.string().optional().nullable(),
    userAgent: z.string().optional().nullable(),
    os: z.string().optional().nullable(),
    device: z.string().optional().nullable(),
    referrer: z.string().optional().nullable(),
})

export type clickTypeSchema = z.infer<typeof clickSchema>

export const clickResponse = z.object({
    clicks: z.array(clickSchema),
    totalPages: z.number().default(999)
})