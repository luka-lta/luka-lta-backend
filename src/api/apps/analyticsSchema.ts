import { z } from "zod";
import { AppAnalyticsSourceSchema } from "@/api/apps/schema";

export const AppAnalyticsPointSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  value: z.number(),
});

export const AppAnalyticsSchema = z.object({
  // In practice never "none" - fetchAppAnalytics returns null for "none"
  // instead of an AppAnalytics object. Reuses the entity's source enum so
  // there is only one definition of what a "source" is.
  source: AppAnalyticsSourceSchema,
  fetchedAt: z.string(),
  primaryMetric: z.object({
    label: z.string(),
    unit: z.string().optional(),
    series: z.array(AppAnalyticsPointSchema),
  }),
  kpis: z.array(z.object({
    label: z.string(),
    value: z.number(),
    unit: z.string().optional(),
  })),
  breakdown: z.array(z.object({
    label: z.string(),
    value: z.number(),
  })).optional(),
});

export type AppAnalyticsPoint = z.infer<typeof AppAnalyticsPointSchema>;
export type AppAnalytics = z.infer<typeof AppAnalyticsSchema>;
