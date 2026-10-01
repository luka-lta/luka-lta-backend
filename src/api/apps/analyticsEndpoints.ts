import { AppAnalyticsSchema, type AppAnalytics } from "@/api/apps/analyticsSchema";
import { generateMockAnalytics } from "@/api/apps/analyticsMock";
import type { AppEntity } from "@/api/apps/schema";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Stands in for a future real endpoint that reads App Store Connect /
 * Firebase / a custom source and normalizes the result into AppAnalytics
 * server-side. Only this file changes when that backend exists - the hook
 * and every UI component stay untouched.
 */
export async function fetchAppAnalytics(app: AppEntity, sourceConfigId: string): Promise<AppAnalytics | null> {
    await delay(300);
    const sourceConfig = app.analyticsSources.find((s) => s.id === sourceConfigId && s.enabled);
    if (!sourceConfig) return null;
    return AppAnalyticsSchema.parse(generateMockAnalytics(sourceConfig.type, sourceConfig.id));
}
