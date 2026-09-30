import { toSqlUtcNow } from "@/lib/dateTimeUtils";
import type { AppEntity, AppInput } from "@/api/apps/schema";

/**
 * In-memory registry backing the mock API layer. Lives only for the
 * session (no localStorage) - this is intentionally not persistence,
 * it's a stand-in for a future real database.
 */
let apps: AppEntity[] = [
    {
        id: "app-pixeldiary",
        name: "PixelDiary",
        description: "Foto-Tagebuch-App mit privatem Cloud-Backup.",
        icon: "smartphone",
        category: "app-store",
        status: "active",
        analyticsSource: "app-store-connect",
        url: "https://apps.apple.com/app/pixeldiary",
        metrics: { revenue: 340, downloads: 12400, rating: 4.6 },
        createdAt: "2026-01-10 09:00:00",
        updatedAt: "2026-09-01 09:00:00",
    },
    {
        id: "app-focusflow",
        name: "FocusFlow",
        description: "Pomodoro- und Fokus-Timer mit Statistiken.",
        icon: "smartphone",
        category: "app-store",
        status: "active",
        analyticsSource: "app-store-connect",
        url: "https://apps.apple.com/app/focusflow",
        metrics: { revenue: 210, downloads: 8100, rating: 4.3 },
        createdAt: "2026-02-15 09:00:00",
        updatedAt: "2026-09-01 09:00:00",
    },
    {
        id: "app-tinybudget",
        name: "TinyBudget",
        description: "Minimalistische Haushaltsbuch-App.",
        icon: "smartphone",
        category: "app-store",
        status: "maintenance",
        analyticsSource: "app-store-connect",
        url: "https://apps.apple.com/app/tinybudget",
        metrics: { revenue: 90, downloads: 5300, rating: 4.1 },
        createdAt: "2026-03-20 09:00:00",
        updatedAt: "2026-09-01 09:00:00",
    },
    {
        id: "app-trackspire",
        name: "Trackspire",
        description: "SaaS-Produkt zum Tracken von Gewohnheiten und Zielen.",
        icon: "rocket",
        category: "saas",
        status: "active",
        analyticsSource: "firebase",
        url: "https://trackspire.app",
        metrics: { mrr: 1310, activeUsers: 187, churnPercent: 3.2 },
        createdAt: "2025-11-01 09:00:00",
        updatedAt: "2026-09-01 09:00:00",
    },
    {
        id: "app-cafe-sonnenblick",
        name: "Café Sonnenblick",
        description: "Website-Projekt für ein lokales Café.",
        icon: "globe",
        category: "client-website",
        status: "active",
        analyticsSource: "none",
        url: "https://cafe-sonnenblick.example.com",
        metrics: { revenue: 850 },
        createdAt: "2026-06-01 09:00:00",
        updatedAt: "2026-09-01 09:00:00",
    },
    {
        id: "app-fitness-nord",
        name: "Fitness Nord GmbH",
        description: "Website- und Buchungssystem für ein Fitnessstudio.",
        icon: "globe",
        category: "client-website",
        status: "active",
        analyticsSource: "none",
        url: "https://fitness-nord.example.com",
        metrics: { revenue: 1450 },
        createdAt: "2026-07-15 09:00:00",
        updatedAt: "2026-09-01 09:00:00",
    },
];

export function listApps(): AppEntity[] {
    return [...apps];
}

export function getAppById(id: string): AppEntity | undefined {
    return apps.find((app) => app.id === id);
}

export function insertApp(input: AppInput): AppEntity {
    const now = toSqlUtcNow();
    const entity: AppEntity = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
    };
    apps = [...apps, entity];
    return entity;
}

export function updateAppById(id: string, input: AppInput): AppEntity | undefined {
    const existing = getAppById(id);
    if (!existing) return undefined;

    const updated: AppEntity = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: toSqlUtcNow(),
    };
    apps = apps.map((app) => (app.id === id ? updated : app));
    return updated;
}

export function removeAppById(id: string): boolean {
    const before = apps.length;
    apps = apps.filter((app) => app.id !== id);
    return apps.length < before;
}
