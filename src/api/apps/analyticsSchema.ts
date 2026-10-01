import { z } from "zod";
import { AppAnalyticsSourceTypeSchema } from "@/api/apps/schema";

export const AppAnalyticsPointSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  value: z.number(),
});

export const AppAnalyticsSchema = z.object({
  // Reuses the entity's source-type enum so there is only one definition
  // of what a source type is. An AppAnalytics object always belongs to one
  // concrete, enabled source config - fetchAppAnalytics returns null when
  // no matching enabled config exists, rather than ever modeling "no source"
  // as a value of this field.
  source: AppAnalyticsSourceTypeSchema,
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
