import { DateTime } from "luxon";
import type { AppAnalyticsSource } from "@/api/apps/schema";
import type { AppAnalytics, AppAnalyticsPoint } from "@/api/apps/analyticsSchema";

/**
 * Deterministic pseudo-random generator seeded by a string, so the same
 * app always gets the same demo numbers within a session instead of a
 * fresh random shape on every render/refetch.
 */
function seededRandom(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildSeries(appId: string, baseValue: number, volatility: number): AppAnalyticsPoint[] {
  const random = seededRandom(`${appId}-series`);
  const points: AppAnalyticsPoint[] = [];
  let current = baseValue;

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = DateTime.now().minus({ days: daysAgo }).toFormat("yyyy-MM-dd");
    const change = (random() - 0.5) * 2 * volatility;
    current = Math.max(0, current + change);
    points.push({ date, value: Math.round(current) });
  }

  return points;
}

function generateAppStoreConnect(appId: string): AppAnalytics {
  const random = seededRandom(`${appId}-asc`);
  return {
    source: "app-store-connect",
    fetchedAt: DateTime.now().toISO(),
    primaryMetric: {
      label: "Downloads",
      series: buildSeries(appId, 200 + Math.round(random() * 300), 25),
    },
    kpis: [
      { label: "Impressions gesamt", value: Math.round(15000 + random() * 25000) },
      { label: "Conversion-Rate", value: Math.round((2 + random() * 4) * 10) / 10, unit: "%" },
      { label: "Crashes", value: Math.round(random() * 12) },
    ],
    breakdown: [
      { label: "Deutschland", value: Math.round(2000 + random() * 3000) },
      { label: "Österreich", value: Math.round(400 + random() * 800) },
      { label: "Schweiz", value: Math.round(300 + random() * 600) },
    ],
  };
}

function generateFirebase(appId: string): AppAnalytics {
  const random = seededRandom(`${appId}-firebase`);
  return {
    source: "firebase",
    fetchedAt: DateTime.now().toISO(),
    primaryMetric: {
      label: "Aktive Nutzer (DAU)",
      series: buildSeries(appId, 80 + Math.round(random() * 150), 12),
    },
    kpis: [
      { label: "MAU", value: Math.round(1500 + random() * 3000) },
      { label: "7-Tage-Retention", value: Math.round((20 + random() * 30) * 10) / 10, unit: "%" },
      { label: "Sessions/User", value: Math.round((2 + random() * 3) * 10) / 10 },
    ],
    breakdown: [
      { label: "app_open", value: Math.round(5000 + random() * 8000) },
      { label: "task_completed", value: Math.round(2000 + random() * 4000) },
      { label: "share_clicked", value: Math.round(300 + random() * 900) },
    ],
  };
}

function generateCustom(appId: string): AppAnalytics {
  const random = seededRandom(`${appId}-custom`);
  return {
    source: "custom",
    fetchedAt: DateTime.now().toISO(),
    primaryMetric: {
      label: "Requests",
      series: buildSeries(appId, 500 + Math.round(random() * 1000), 80),
    },
    kpis: [
      { label: "Ø Latenz", value: Math.round(40 + random() * 160), unit: "ms" },
      { label: "Error-Rate", value: Math.round((0.1 + random() * 2) * 100) / 100, unit: "%" },
      { label: "Uptime", value: Math.round((98 + random() * 2) * 100) / 100, unit: "%" },
    ],
    breakdown: [
      { label: "/api/users", value: Math.round(3000 + random() * 5000) },
      { label: "/api/orders", value: Math.round(1500 + random() * 3000) },
      { label: "/api/health", value: Math.round(8000 + random() * 4000) },
    ],
  };
}

export function generateMockAnalytics(
  source: Exclude<AppAnalyticsSource, "none">,
  appId: string
): AppAnalytics {
  if (source === "app-store-connect") return generateAppStoreConnect(appId);
  if (source === "firebase") return generateFirebase(appId);
  return generateCustom(appId);
}
