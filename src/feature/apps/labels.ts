import type { AppAnalyticsSourceType, AppCategory, AppStatus } from "@/api/apps/schema";

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

export const STATUS_BADGE_CLASS: Record<AppStatus, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-transparent",
    inactive: "bg-muted text-muted-foreground border-transparent",
    maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-transparent",
    archived: "bg-muted text-muted-foreground border-transparent",
    planned: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border-transparent",
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
    rating: "Rating",
    mrr: "MRR",
    activeUsers: "Aktive User",
    churnPercent: "Churn",
} as const;
