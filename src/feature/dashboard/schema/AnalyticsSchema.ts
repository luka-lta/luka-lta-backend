import {z} from "zod";

export const clicksSchema = z.object({
    displayname: z.string(),
    click_date: z.string(),
    total_clicks: z.number(),
})

export const clicksListSchema = z.object({
    clicks: z.array(clicksSchema),
    totalPages: z.number().default(999)
})

export type ClicksTypeSchema = z.infer<typeof clicksSchema>;
