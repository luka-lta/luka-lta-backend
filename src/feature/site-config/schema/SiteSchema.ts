import {z} from "zod";

export const SiteConfigSchema = z.object({
    webVitals: z.boolean(),
    trackErrors: z.boolean(),
    trackOutbound: z.boolean(),
    trackUrlParams: z.boolean(),
    trackInitialPageView: z.boolean(),
    trackSpaNavigation: z.boolean(),
    trackCopy: z.boolean(),
    trackButtonClicks: z.boolean(),
    trackFormInteractions: z.boolean(),
})

export const SiteSchema = z.object({
    siteId: z.number(),
    name: z.string(),
    domain: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: z.object({}),
    public: z.boolean(),
    blockBots: z.boolean(),
    excludedIps: z.array(z.string()),
    excludedCountries: z.array(z.string()),
    siteConfig: SiteConfigSchema,
    trackIp: z.boolean(),
});

export const siteApiResult = z.object({
    site: SiteSchema,
});

export type SiteTypeSchema = z.infer<typeof SiteSchema>;

export type SiteConfigurationTypeSchema = z.infer<typeof SiteConfigSchema>;
