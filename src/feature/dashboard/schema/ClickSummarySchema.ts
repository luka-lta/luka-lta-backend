import {z} from "zod";

export const ClicksMonthlySchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM Format
    displayname: z.string(),
    total_clicks: z.number().int().nonnegative(),
});

export const ClicksDailySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD Format
    displayname: z.string(),
    total_clicks: z.number().int().nonnegative(),
});

const SummarySchema = z.object({
    totalClicks: z.number().int().nonnegative(),
    clicksMonthly: z.array(ClicksMonthlySchema),
    clicksDaily: z.array(ClicksDailySchema),
});

export const summaryListSchema = z.object({
    summary: SummarySchema,
    totalPages: z.number().default(999)
})

export type SummaryTypeSchema = z.infer<typeof SummarySchema>;
export type ClicksMonthlyTypeSchema = z.infer<typeof ClicksMonthlySchema>;
export type ClicksDailyTypeSchema = z.infer<typeof ClicksDailySchema>;
