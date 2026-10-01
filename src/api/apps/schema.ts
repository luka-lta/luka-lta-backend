// src/api/apps/schema.ts
import { z } from "zod";

export const AppCategorySchema = z.enum([
    "app-store",
    "client-website",
    "saas",
    "internal-tool",
    "other",
]);

export const AppStatusSchema = z.enum([
    "active",
    "inactive",
    "maintenance",
    "archived",
    "planned",
]);

export const AppAnalyticsSourceTypeSchema = z.enum([
    "app-store-connect",
    "firebase",
    "custom",
]);

export const AppAnalyticsSourceConfigSchema = z.object({
    id: z.string(),
    type: AppAnalyticsSourceTypeSchema,
    enabled: z.boolean().default(true),
    // Generic key-value map; which keys are expected depends on `type`
    // (see src/feature/apps/labels.ts). Plain-text demo placeholder only -
    // a future real backend decides how credentials are actually stored.
    credentials: z.record(z.string(), z.string()).default({}),
});

// Icon keys live in the API layer (not in feature/apps) so schema.ts never
// depends on a UI module. feature/apps/iconOptions.ts maps these keys to
// lucide components.
export const APP_ICON_KEYS = [
    "smartphone",
    "globe",
    "server",
    "boxes",
    "rocket",
    "creditCard",
    "code",
    "database",
    "shoppingBag",
    "lineChart",
] as const;
export const AppIconKeySchema = z.enum(APP_ICON_KEYS);

export const AppMetricsSchema = z.object({
    revenue: z.number().nonnegative().optional(),
    downloads: z.number().int().nonnegative().optional(),
    rating: z.number().min(0).max(5).optional(),
    mrr: z.number().nonnegative().optional(),
    activeUsers: z.number().int().nonnegative().optional(),
    churnPercent: z.number().min(0).max(100).optional(),
});

export const AppEntitySchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    icon: AppIconKeySchema,
    category: AppCategorySchema,
    status: AppStatusSchema,
    analyticsSources: z.array(AppAnalyticsSourceConfigSchema).default([]),
    url: z.string().url().optional(),
    metrics: AppMetricsSchema.optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const appListSchema = z.object({ apps: z.array(AppEntitySchema) });

export const AppInputSchema = AppEntitySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export type AppCategory = z.infer<typeof AppCategorySchema>;
export type AppStatus = z.infer<typeof AppStatusSchema>;
export type AppAnalyticsSourceType = z.infer<typeof AppAnalyticsSourceTypeSchema>;
export type AppAnalyticsSourceConfig = z.infer<typeof AppAnalyticsSourceConfigSchema>;
export type AppIconKey = z.infer<typeof AppIconKeySchema>;
export type AppMetrics = z.infer<typeof AppMetricsSchema>;
export type AppEntity = z.infer<typeof AppEntitySchema>;
export type AppInput = z.infer<typeof AppInputSchema>;
