import {z} from "zod";

export const browserStatSchema = z.object({
    browser: z.string(),
    amount: z.number().int().nonnegative(),
    percentage: z.number().int().min(0).max(100),
});

export const operationSystemStatSchema = z.object({
    os: z.string(),
    amount: z.number().int().nonnegative(),
    percentage: z.number().int().min(0).max(100),
});

export const deviceStatSchema = z.object({
    device: z.string(),
    amount: z.number().int().nonnegative(),
    percentage: z.number().int().min(0).max(100),
});

export const marketStatSchema = z.object({
    market: z.string(),
    amount: z.number().int().nonnegative(),
    percentage: z.number().int().min(0).max(100),
});

export const statisticListSchema = z.object({
    statistics: z.array(
        z.union([
            browserStatSchema,
            operationSystemStatSchema,
            deviceStatSchema,
            marketStatSchema
        ])
    ),
});

export type deviceStatType = z.infer<typeof deviceStatSchema>;
export type osStatType = z.infer<typeof operationSystemStatSchema>;
export type browserStatType = z.infer<typeof browserStatSchema>;
export type marketStatType = z.infer<typeof marketStatSchema>;
