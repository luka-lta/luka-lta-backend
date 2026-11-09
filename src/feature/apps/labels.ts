import type { AppAnalyticsSourceType, AppCategory, AppEntity, AppStatus } from "@/api/apps/schema";
import type { StatusTone } from "@/components/feedback/status-badge";

export const CATEGORY_LABELS: Record<AppCategory, string> = {
    "app-store": "App Store",
    "client-website": "Kundenwebseite",
    saas: "SaaS",
    "internal-tool": "Internes Tool",
    other: "Sonstiges",
};

export const STATUS_LABELS: Record<AppStatus, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    maintenance: "Wartung",
    archived: "Archiviert",
    planned: "Geplant",
};

export const STATUS_TONE: Record<AppStatus, StatusTone> = {
    active: "success",
    inactive: "neutral",
    maintenance: "warning",
    archived: "neutral",
    planned: "info",
};

export const ANALYTICS_SOURCE_TYPE_LABELS: Record<AppAnalyticsSourceType, string> = {
    "app-store-connect": "App Store Connect",
    firebase: "Firebase",
    custom: "Eigene Quelle",
};

export interface AnalyticsCredentialField {
    key: string;
    label: string;
    multiline?: boolean;
}

export const ANALYTICS_CREDENTIAL_FIELDS: Record<AppAnalyticsSourceType, AnalyticsCredentialField[]> = {
    "app-store-connect": [
        { key: "issuerId", label: "Issuer ID" },
        { key: "keyId", label: "Key ID" },
        { key: "privateKey", label: "Private Key", multiline: true },
    ],
    firebase: [
        { key: "projectId", label: "Project ID" },
        { key: "serviceAccountJson", label: "Service-Account-JSON", multiline: true },
    ],
    custom: [
        { key: "baseUrl", label: "Base-URL" },
        { key: "apiKey", label: "API-Key" },
    ],
};

export const METRIC_LABELS = {
    revenue: "Umsatz",
    downloads: "Downloads",
    rating: "Bewertung",
    mrr: "MRR",
    activeUsers: "Aktive Nutzer",
    churnPercent: "Churn",
} as const;

export type MetricKey = keyof NonNullable<AppEntity["metrics"]>;

export function formatMetricValue(key: MetricKey, value: number): string {
    if (key === "revenue" || key === "mrr") return `${value.toLocaleString("de-DE")} €`;
    if (key === "rating") return value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (key === "churnPercent") return `${value.toLocaleString("de-DE")} %`;
    return value.toLocaleString("de-DE");
}

/** Nur gesetzte Kennzahlen, in fester Reihenfolge. */
export function getMetricEntries(app: AppEntity): [MetricKey, number][] {
    if (!app.metrics) return [];
    return (Object.entries(app.metrics) as [MetricKey, number | undefined][])
        .filter((entry): entry is [MetricKey, number] => entry[1] !== undefined);
}
