# App Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded App-Store-apps array in the dashboard with a generic, CRUD-able "App Registry" (add/edit/delete via UI), backed by a mock service layer shaped like a future real API.

**Architecture:** `UI (feature/apps) → hooks (react-query) → endpoints (async, zod-parsed) → mockStore (in-memory array)`. Mirrors the existing `blog` feature's layering 1:1 (`src/api/blog/{endpoints,hooks}.ts`). Only `endpoints.ts` will need to change when a real backend arrives.

**Tech Stack:** React, TypeScript, TanStack Query (react-query), Zod, react-hook-form, shadcn/ui (Dialog, Select, Card, Badge, Empty), Tailwind, Vite.

**Spec:** `docs/superpowers/specs/2026-09-29-app-registry-design.md`

## Global Constraints

- No test runner is configured in this repo (no `test` script, no `*.test.*` files anywhere). Established project convention (confirmed via prior dashboard work) is: verify with `npx tsc --noEmit` + `npx eslint <touched files>` per task, plus a manual browser walkthrough at the end. Every task below substitutes this for the unit-test steps a TDD template would normally use — do not add a new test framework, that's out of scope.
- `declare(strict_types=1)`-equivalent for TS: no `any`, every exported function/type fully typed (existing project rule, see CLAUDE.md).
- 4-space indentation is NOT used in this TS/TSX codebase — match surrounding files (this repo uses tabs-as-4-spaces already configured via existing `.tsx` files; just match the file you're editing, all touched files here use 4-space soft indent as shown in the code blocks).
- State for the mock registry lives in-memory only for the session (no `localStorage`) — confirmed decision, do not add persistence.
- `icon` on `AppEntity` is a string key from a fixed enum (`AppIconKeySchema`), never a component reference — keeps the entity JSON-serializable for a future real API.
- Apps must never be hardcoded into any UI component — every app-list render must come from `useAppList()`.

## Review Focus

- Deleting the last app-store-category app: `AppStoreMetricsCard` and the "App Store Revenue" KPI must show an empty/zero state, not crash or show `NaN`.
- No `saas`-category app exists (deleted or never created): `TrackspireKpisCard` and the "Trackspire MRR" KPI must render a sensible fallback (0 / em-dash), not throw on `undefined`.
- Creating an app with all metrics fields left blank: `AppCard` must render with no metrics row at all, not a row of `undefined`/`NaN`.
- Submitting the form with an invalid URL (e.g. `"not-a-url"`): validation must reject it inline, never save a broken link.
- Editing an app's category away from `app-store`: after save, it must disappear from `AppStoreMetricsCard` immediately (query invalidation), not linger from a stale cache.

---

## File Structure

```
src/api/apps/
  schema.ts       — Zod schemas + inferred types (Task 1)
  mockStore.ts    — in-memory array + seed data + CRUD primitives (Task 2)
  endpoints.ts    — async, zod-parsed functions; the future API boundary (Task 3)
  hooks.ts        — react-query hooks (Task 4)

src/feature/apps/
  labels.ts               — category/status display labels + badge colors (Task 5)
  iconOptions.ts          — icon key -> lucide component map (Task 5)
  components/
    AppCard.tsx           — presentational, data-driven card (Task 6)
    EmptyAppsState.tsx     (Task 7)
    AppFormDialog.tsx      — create+edit dialog/form (Task 8)
    DeleteAppDialog.tsx     (Task 9)
  index.tsx               — Apps page: grid + dialogs + empty state (Task 10)

src/pages/Dashboard/AppsPage.tsx   — route wrapper (Task 11)
src/AppRouter.tsx                  — modify: add /dashboard/apps route (Task 11)
src/components/layout/data/sidebar-data.ts — modify: add "Apps" nav item (Task 11)

src/feature/dashboard/business/
  AppStoreMetricsCard.tsx  — modify: source from useAppList (Task 12)
  BusinessSummaryKpis.tsx  — modify: derive KPIs from useAppList (Task 13)
  TrackspireKpisCard.tsx   — modify: derive header stats from useAppList (Task 14)
  demoData.ts              — modify: drop app-derived data, keep the rest (Task 15)
```

---

### Task 1: API schema layer

**Files:**
- Create: `src/api/apps/schema.ts`

**Interfaces:**
- Produces: `AppCategorySchema`, `AppStatusSchema`, `APP_ICON_KEYS`, `AppIconKeySchema`, `AppMetricsSchema`, `AppEntitySchema`, `appListSchema`, `AppInputSchema`, and types `AppEntity`, `AppCategory`, `AppStatus`, `AppMetrics`, `AppIconKey`, `AppInput`.

- [ ] **Step 1: Write the schema file**

```ts
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
export type AppIconKey = z.infer<typeof AppIconKeySchema>;
export type AppMetrics = z.infer<typeof AppMetricsSchema>;
export type AppEntity = z.infer<typeof AppEntitySchema>;
export type AppInput = z.infer<typeof AppInputSchema>;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found` (this file has no consumers yet, so it can only fail on syntax/type errors within itself).

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/schema.ts`
Expected: `No issues found` (or exit code 0 with no output).

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/schema.ts
git commit -m "feat(apps): add app registry zod schema and types"
```

---

### Task 2: Mock store (in-memory CRUD + seed data)

**Files:**
- Create: `src/api/apps/mockStore.ts`

**Interfaces:**
- Consumes: `AppEntity`, `AppInput` from `src/api/apps/schema.ts` (Task 1).
- Produces: `listApps(): AppEntity[]`, `getAppById(id: string): AppEntity | undefined`, `insertApp(input: AppInput): AppEntity`, `updateAppById(id: string, input: AppInput): AppEntity | undefined`, `removeAppById(id: string): boolean`.

- [ ] **Step 1: Write the mock store**

```ts
// src/api/apps/mockStore.ts
import { toSqlUtcNow } from "@/lib/dateTimeUtils.ts";
import type { AppEntity, AppInput } from "@/api/apps/schema.ts";

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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/mockStore.ts`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/mockStore.ts
git commit -m "feat(apps): add in-memory mock store with seed apps"
```

---

### Task 3: Endpoints layer (mock, shaped like a real API)

**Files:**
- Create: `src/api/apps/endpoints.ts`

**Interfaces:**
- Consumes: `listApps`, `getAppById`, `insertApp`, `updateAppById`, `removeAppById` from `src/api/apps/mockStore.ts` (Task 2); `AppEntitySchema`, `AppEntity`, `AppInput` from `src/api/apps/schema.ts` (Task 1).
- Produces: `fetchAppList(): Promise<AppEntity[]>`, `fetchApp(id: string): Promise<AppEntity>`, `createApp(input: AppInput): Promise<AppEntity>`, `updateApp(id: string, input: AppInput): Promise<AppEntity>`, `deleteApp(id: string): Promise<void>`.

- [ ] **Step 1: Write the endpoints file**

```ts
// src/api/apps/endpoints.ts
import { AppEntitySchema, type AppEntity, type AppInput } from "@/api/apps/schema.ts";
import { getAppById, insertApp, listApps, removeAppById, updateAppById } from "@/api/apps/mockStore.ts";

/**
 * Mock latency so loading states behave like a real network call.
 * This whole file is the ONLY place that needs to change when a real
 * backend exists - hooks.ts and the UI stay untouched.
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAppList(): Promise<AppEntity[]> {
    await delay(300);
    return listApps().map((app) => AppEntitySchema.parse(app));
}

export async function fetchApp(id: string): Promise<AppEntity> {
    await delay(200);
    const app = getAppById(id);
    if (!app) throw new Error(`App not found: ${id}`);
    return AppEntitySchema.parse(app);
}

export async function createApp(input: AppInput): Promise<AppEntity> {
    await delay(300);
    return AppEntitySchema.parse(insertApp(input));
}

export async function updateApp(id: string, input: AppInput): Promise<AppEntity> {
    await delay(300);
    const updated = updateAppById(id, input);
    if (!updated) throw new Error(`App not found: ${id}`);
    return AppEntitySchema.parse(updated);
}

export async function deleteApp(id: string): Promise<void> {
    await delay(300);
    const removed = removeAppById(id);
    if (!removed) throw new Error(`App not found: ${id}`);
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/endpoints.ts`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/endpoints.ts
git commit -m "feat(apps): add mock endpoints layer shaped like future real API"
```

---

### Task 4: React-query hooks

**Files:**
- Create: `src/api/apps/hooks.ts`

**Interfaces:**
- Consumes: `fetchAppList`, `fetchApp`, `createApp`, `updateApp`, `deleteApp` from `src/api/apps/endpoints.ts` (Task 3); `AppInput` from `src/api/apps/schema.ts` (Task 1).
- Produces: `useAppList()`, `useApp(id: string)`, `useCreateApp()`, `useUpdateApp(id: string)`, `useDeleteApp()`. `useAppList()` returns a `UseQueryResult<AppEntity[], Error>` directly (no tuple - simpler than the blog list hook since there's no filter state yet).

- [ ] **Step 1: Write the hooks file**

```ts
// src/api/apps/hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createApp, deleteApp, fetchApp, fetchAppList, updateApp } from "@/api/apps/endpoints.ts";
import type { AppInput } from "@/api/apps/schema.ts";

export function useAppList() {
    return useQuery({
        queryKey: ["apps", "list"],
        queryFn: fetchAppList,
    });
}

export function useApp(id: string) {
    return useQuery({
        queryKey: ["apps", "detail", id],
        queryFn: () => fetchApp(id),
        enabled: !!id,
    });
}

export function useCreateApp() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: AppInput) => createApp(input),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["apps", "list"] }),
    });
}

export function useUpdateApp(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: AppInput) => updateApp(id, input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["apps", "list"] });
            qc.invalidateQueries({ queryKey: ["apps", "detail", id] });
        },
    });
}

export function useDeleteApp() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteApp(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["apps", "list"] }),
    });
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/hooks.ts`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/hooks.ts
git commit -m "feat(apps): add react-query hooks for app registry"
```

---

### Task 5: Icon options + shared labels

**Files:**
- Create: `src/feature/apps/iconOptions.ts`
- Create: `src/feature/apps/labels.ts`

**Interfaces:**
- Consumes: `AppIconKey`, `APP_ICON_KEYS`, `AppCategory`, `AppStatus` from `src/api/apps/schema.ts` (Task 1).
- Produces: `APP_ICON_OPTIONS: Record<AppIconKey, LucideIcon>`, `getAppIcon(key: AppIconKey): LucideIcon`; `CATEGORY_LABELS: Record<AppCategory, string>`, `STATUS_LABELS: Record<AppStatus, string>`, `STATUS_BADGE_CLASS: Record<AppStatus, string>`, `METRIC_LABELS` (object with `revenue`, `downloads`, `rating`, `mrr`, `activeUsers`, `churnPercent` string labels).

- [ ] **Step 1: Write the icon options file**

```ts
// src/feature/apps/iconOptions.ts
import {
    Boxes,
    Code2,
    CreditCard,
    Database,
    Globe,
    LineChart,
    type LucideIcon,
    Rocket,
    Server,
    ShoppingBag,
    Smartphone,
} from "lucide-react";
import type { AppIconKey } from "@/api/apps/schema.ts";

export const APP_ICON_OPTIONS: Record<AppIconKey, LucideIcon> = {
    smartphone: Smartphone,
    globe: Globe,
    server: Server,
    boxes: Boxes,
    rocket: Rocket,
    creditCard: CreditCard,
    code: Code2,
    database: Database,
    shoppingBag: ShoppingBag,
    lineChart: LineChart,
};

export function getAppIcon(key: AppIconKey): LucideIcon {
    return APP_ICON_OPTIONS[key] ?? Boxes;
}
```

- [ ] **Step 2: Write the labels file**

```ts
// src/feature/apps/labels.ts
import type { AppCategory, AppStatus } from "@/api/apps/schema.ts";

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

export const METRIC_LABELS = {
    revenue: "Umsatz",
    downloads: "Downloads",
    rating: "Rating",
    mrr: "MRR",
    activeUsers: "Aktive User",
    churnPercent: "Churn",
} as const;
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 4: Lint**

Run: `npx eslint src/feature/apps/iconOptions.ts src/feature/apps/labels.ts`
Expected: `No issues found`

- [ ] **Step 5: Commit**

```bash
git add src/feature/apps/iconOptions.ts src/feature/apps/labels.ts
git commit -m "feat(apps): add icon options and shared category/status labels"
```

---

### Task 6: AppCard component

**Files:**
- Create: `src/feature/apps/components/AppCard.tsx`

**Interfaces:**
- Consumes: `AppEntity` from `src/api/apps/schema.ts` (Task 1); `getAppIcon` from `iconOptions.ts`, `CATEGORY_LABELS`, `STATUS_LABELS`, `STATUS_BADGE_CLASS`, `METRIC_LABELS` from `labels.ts` (Task 5).
- Produces: `AppCard` component, `Props: { app: AppEntity; onEdit: (app: AppEntity) => void; onDelete: (app: AppEntity) => void }`. Used by Task 10 (Apps page) and read as reference by Task 12 (Business card does NOT reuse this component - it has its own compact list row, see Task 12 notes).

- [ ] **Step 1: Write the component**

```tsx
// src/feature/apps/components/AppCard.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { AppEntity } from "@/api/apps/schema.ts";
import { getAppIcon } from "@/feature/apps/iconOptions.ts";
import { CATEGORY_LABELS, METRIC_LABELS, STATUS_BADGE_CLASS, STATUS_LABELS } from "@/feature/apps/labels.ts";

interface AppCardProps {
    app: AppEntity;
    onEdit: (app: AppEntity) => void;
    onDelete: (app: AppEntity) => void;
}

function formatMetricValue(key: keyof NonNullable<AppEntity["metrics"]>, value: number): string {
    if (key === "revenue" || key === "mrr") return `${value.toLocaleString("de-DE")} €`;
    if (key === "rating") return value.toFixed(1);
    if (key === "churnPercent") return `${value}%`;
    return value.toLocaleString("de-DE");
}

export function AppCard({ app, onEdit, onDelete }: AppCardProps) {
    const Icon = getAppIcon(app.icon);
    const metricEntries = app.metrics
        ? (Object.entries(app.metrics) as [keyof NonNullable<AppEntity["metrics"]>, number | undefined][])
            .filter((entry): entry is [keyof NonNullable<AppEntity["metrics"]>, number] => entry[1] !== undefined)
        : [];

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{app.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{CATEGORY_LABELS[app.category]}</Badge>
                    <Badge className={cn(STATUS_BADGE_CLASS[app.status])}>{STATUS_LABELS[app.status]}</Badge>
                </div>
                {metricEntries.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {metricEntries.map(([key, value]) => (
                            <div key={key}>
                                <p className="text-muted-foreground text-xs">{METRIC_LABELS[key]}</p>
                                <p className="font-medium tabular-nums">{formatMetricValue(key, value)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                {app.url ? (
                    <a
                        href={app.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Öffnen
                    </a>
                ) : (
                    <span />
                )}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(app)} aria-label={`${app.name} bearbeiten`}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(app)} aria-label={`${app.name} löschen`}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/components/AppCard.tsx`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/components/AppCard.tsx
git commit -m "feat(apps): add data-driven AppCard component"
```

---

### Task 7: Empty state

**Files:**
- Create: `src/feature/apps/components/EmptyAppsState.tsx`

**Interfaces:**
- Consumes: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` from `@/components/ui/empty.tsx` (existing).
- Produces: `EmptyAppsState` component, `Props: { onCreate: () => void }`. Used by Task 10.

- [ ] **Step 1: Write the component**

```tsx
// src/feature/apps/components/EmptyAppsState.tsx
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Boxes, Plus } from "lucide-react";

interface EmptyAppsStateProps {
    onCreate: () => void;
}

export function EmptyAppsState({ onCreate }: EmptyAppsStateProps) {
    return (
        <Empty className="border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Boxes />
                </EmptyMedia>
                <EmptyTitle>Noch keine Apps angelegt</EmptyTitle>
                <EmptyDescription>
                    Lege deine erste App an — z. B. eine App-Store-App, eine Kundenwebseite oder ein SaaS-Produkt.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button onClick={onCreate}>
                    <Plus className="h-4 w-4" />
                    Erste App anlegen
                </Button>
            </EmptyContent>
        </Empty>
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/components/EmptyAppsState.tsx`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/components/EmptyAppsState.tsx
git commit -m "feat(apps): add empty state for apps registry"
```

---

### Task 8: Create/Edit form dialog

**Files:**
- Create: `src/feature/apps/components/AppFormDialog.tsx`

**Interfaces:**
- Consumes: `AppEntity`, `AppInput`, `AppCategorySchema`, `AppStatusSchema`, `AppIconKeySchema`, `APP_ICON_KEYS` from `src/api/apps/schema.ts`; `useCreateApp`, `useUpdateApp` from `src/api/apps/hooks.ts` (Task 4); `APP_ICON_OPTIONS` from `iconOptions.ts`; `CATEGORY_LABELS`, `STATUS_LABELS` from `labels.ts` (Task 5).
- Produces: `AppFormDialog` component, `Props: { open: boolean; onOpenChange: (open: boolean) => void; mode: "create" | "edit"; defaultValues?: AppEntity }`. Used by Task 10.

- [ ] **Step 1: Write the dialog + form**

```tsx
// src/feature/apps/components/AppFormDialog.tsx
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Spinner } from "@/components/ui/kibo-ui/spinner/index.tsx";
import { AppCategorySchema, AppIconKeySchema, AppStatusSchema, type AppEntity, type AppInput } from "@/api/apps/schema.ts";
import { useCreateApp, useUpdateApp } from "@/api/apps/hooks.ts";
import { APP_ICON_OPTIONS } from "@/feature/apps/iconOptions.ts";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/feature/apps/labels.ts";

const appFormSchema = z.object({
    name: z.string().min(1, "Name ist erforderlich").max(100, "Maximal 100 Zeichen"),
    description: z.string().max(500, "Maximal 500 Zeichen"),
    icon: AppIconKeySchema,
    category: AppCategorySchema,
    status: AppStatusSchema,
    url: z.string().max(2048).refine((val) => val === "" || /^https?:\/\/.+/.test(val), {
        message: "Muss eine gültige URL sein (http:// oder https://)",
    }),
    metricsRevenue: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein"),
    metricsDownloads: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein"),
    metricsRating: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein"),
    metricsMrr: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein"),
    metricsActiveUsers: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein"),
    metricsChurnPercent: z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein"),
});

type AppFormValues = z.infer<typeof appFormSchema>;

const emptyFormValues: AppFormValues = {
    name: "",
    description: "",
    icon: "boxes",
    category: "other",
    status: "active",
    url: "",
    metricsRevenue: "",
    metricsDownloads: "",
    metricsRating: "",
    metricsMrr: "",
    metricsActiveUsers: "",
    metricsChurnPercent: "",
};

function toFormValues(app: AppEntity): AppFormValues {
    return {
        name: app.name,
        description: app.description,
        icon: app.icon,
        category: app.category,
        status: app.status,
        url: app.url ?? "",
        metricsRevenue: app.metrics?.revenue?.toString() ?? "",
        metricsDownloads: app.metrics?.downloads?.toString() ?? "",
        metricsRating: app.metrics?.rating?.toString() ?? "",
        metricsMrr: app.metrics?.mrr?.toString() ?? "",
        metricsActiveUsers: app.metrics?.activeUsers?.toString() ?? "",
        metricsChurnPercent: app.metrics?.churnPercent?.toString() ?? "",
    };
}

function parseOptionalNumber(value: string): number | undefined {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function toAppInput(values: AppFormValues): AppInput {
    const metrics = {
        revenue: parseOptionalNumber(values.metricsRevenue),
        downloads: parseOptionalNumber(values.metricsDownloads),
        rating: parseOptionalNumber(values.metricsRating),
        mrr: parseOptionalNumber(values.metricsMrr),
        activeUsers: parseOptionalNumber(values.metricsActiveUsers),
        churnPercent: parseOptionalNumber(values.metricsChurnPercent),
    };
    const hasMetrics = Object.values(metrics).some((v) => v !== undefined);

    return {
        name: values.name,
        description: values.description,
        icon: values.icon,
        category: values.category,
        status: values.status,
        url: values.url.trim() === "" ? undefined : values.url.trim(),
        metrics: hasMetrics ? metrics : undefined,
    };
}

interface AppFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    defaultValues?: AppEntity;
}

export function AppFormDialog({ open, onOpenChange, mode, defaultValues }: AppFormDialogProps) {
    const createApp = useCreateApp();
    const updateApp = useUpdateApp(defaultValues?.id ?? "");
    const isPending = mode === "create" ? createApp.isPending : updateApp.isPending;

    const form = useForm<AppFormValues>({
        resolver: zodResolver(appFormSchema),
        defaultValues: emptyFormValues,
    });

    useEffect(() => {
        if (!open) return;
        form.reset(defaultValues ? toFormValues(defaultValues) : emptyFormValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, defaultValues?.id]);

    function onSubmit(values: AppFormValues) {
        const input = toAppInput(values);
        const mutation = mode === "create" ? createApp : updateApp;

        mutation.mutate(input, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(mode === "create" ? "App angelegt" : "App aktualisiert");
            },
            onError: (error) => toast.error(error.message),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Neue App anlegen" : "App bearbeiten"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="app-name">Name *</Label>
                        <Input id="app-name" placeholder="z. B. PixelDiary" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="app-description">Beschreibung</Label>
                        <Textarea id="app-description" rows={2} className="resize-none" {...form.register("description")} />
                        {form.formState.errors.description && (
                            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Kategorie</Label>
                            <Controller
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Icon</Label>
                        <Controller
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(APP_ICON_OPTIONS).map(([key, Icon]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => field.onChange(key)}
                                            className={`flex items-center justify-center rounded-md border p-2 hover:bg-muted ${field.value === key ? "border-primary bg-muted" : "border-border"}`}
                                            aria-label={key}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="app-url">URL</Label>
                        <Input id="app-url" placeholder="https://..." {...form.register("url")} />
                        {form.formState.errors.url && (
                            <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
                        )}
                    </div>

                    <fieldset className="space-y-3 rounded-md border p-3">
                        <legend className="px-1 text-sm font-medium">Metriken (optional)</legend>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="app-revenue" className="text-xs">Umsatz (€)</Label>
                                <Input id="app-revenue" inputMode="decimal" {...form.register("metricsRevenue")} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-downloads" className="text-xs">Downloads</Label>
                                <Input id="app-downloads" inputMode="numeric" {...form.register("metricsDownloads")} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-rating" className="text-xs">Rating (0-5)</Label>
                                <Input id="app-rating" inputMode="decimal" {...form.register("metricsRating")} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-mrr" className="text-xs">MRR (€)</Label>
                                <Input id="app-mrr" inputMode="decimal" {...form.register("metricsMrr")} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-active-users" className="text-xs">Aktive User</Label>
                                <Input id="app-active-users" inputMode="numeric" {...form.register("metricsActiveUsers")} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-churn" className="text-xs">Churn (%)</Label>
                                <Input id="app-churn" inputMode="decimal" {...form.register("metricsChurnPercent")} />
                            </div>
                        </div>
                    </fieldset>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Spinner size={14} />}
                            {mode === "create" ? "Anlegen" : "Speichern"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/components/AppFormDialog.tsx`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/components/AppFormDialog.tsx
git commit -m "feat(apps): add create/edit form dialog with validation"
```

---

### Task 9: Delete confirmation dialog

**Files:**
- Create: `src/feature/apps/components/DeleteAppDialog.tsx`

**Interfaces:**
- Consumes: `ConfirmDialog` from `@/components/confirm-dialog.tsx` (existing); `useDeleteApp` from `src/api/apps/hooks.ts` (Task 4); `AppEntity` from `src/api/apps/schema.ts`.
- Produces: `DeleteAppDialog` component, `Props: { open: boolean; onOpenChange: (open: boolean) => void; app: AppEntity }`. Used by Task 10.

- [ ] **Step 1: Write the component**

```tsx
// src/feature/apps/components/DeleteAppDialog.tsx
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog.tsx";
import { useDeleteApp } from "@/api/apps/hooks.ts";
import type { AppEntity } from "@/api/apps/schema.ts";

interface DeleteAppDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    app: AppEntity;
}

export function DeleteAppDialog({ open, onOpenChange, app }: DeleteAppDialogProps) {
    const deleteApp = useDeleteApp();

    function handleConfirm() {
        deleteApp.mutate(app.id, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success("App gelöscht");
            },
            onError: (error) => toast.error(error.message),
        });
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleConfirm}
            title={
                <span className="text-destructive">
                    <AlertTriangle className="stroke-destructive mr-1 inline-block" size={18} />
                    App löschen
                </span>
            }
            desc={
                <p>
                    App <span className="font-bold">{app.name}</span> wirklich löschen? Das kann nicht rückgängig
                    gemacht werden.
                </p>
            }
            confirmText={deleteApp.isPending ? "Löschen..." : "Löschen"}
            isLoading={deleteApp.isPending}
            destructive
        />
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/components/DeleteAppDialog.tsx`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/components/DeleteAppDialog.tsx
git commit -m "feat(apps): add delete confirmation dialog"
```

---

### Task 10: Apps page (assembles grid, dialogs, empty/loading/error states)

**Files:**
- Create: `src/feature/apps/index.tsx`

**Interfaces:**
- Consumes: `useAppList` from `src/api/apps/hooks.ts` (Task 4); `AppCard` (Task 6), `EmptyAppsState` (Task 7), `AppFormDialog` (Task 8), `DeleteAppDialog` (Task 9); `Main` from `@/components/layout/main.tsx` (existing); `Skeleton` from `@/components/ui/skeleton.tsx` (existing).
- Produces: default export `Apps` component. Used by Task 11 (`AppsPage.tsx`).

- [ ] **Step 1: Write the page**

```tsx
// src/feature/apps/index.tsx
import { useState } from "react";
import { Main } from "@/components/layout/main.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Plus } from "lucide-react";
import { useAppList } from "@/api/apps/hooks.ts";
import type { AppEntity } from "@/api/apps/schema.ts";
import { AppCard } from "@/feature/apps/components/AppCard.tsx";
import { EmptyAppsState } from "@/feature/apps/components/EmptyAppsState.tsx";
import { AppFormDialog } from "@/feature/apps/components/AppFormDialog.tsx";
import { DeleteAppDialog } from "@/feature/apps/components/DeleteAppDialog.tsx";

function Apps() {
    const appList = useAppList();
    const [formState, setFormState] = useState<{ mode: "create" | "edit"; app?: AppEntity } | null>(null);
    const [appToDelete, setAppToDelete] = useState<AppEntity | null>(null);

    const apps = appList.data ?? [];

    return (
        <Main>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Apps</h1>
                    <p className="text-muted-foreground">Verwalte alle Apps, Webseiten und Produkte an einem Ort.</p>
                </div>
                {apps.length > 0 && (
                    <Button onClick={() => setFormState({ mode: "create" })}>
                        <Plus className="h-4 w-4" />
                        Neue App
                    </Button>
                )}
            </div>

            {appList.isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-lg" />
                    ))}
                </div>
            )}

            {appList.isError && (
                <Alert variant="destructive">
                    <AlertTitle>Apps konnten nicht geladen werden</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{appList.error.message}</span>
                        <Button variant="outline" size="sm" onClick={() => appList.refetch()}>
                            Erneut versuchen
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {!appList.isLoading && !appList.isError && apps.length === 0 && (
                <EmptyAppsState onCreate={() => setFormState({ mode: "create" })} />
            )}

            {!appList.isLoading && !appList.isError && apps.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => (
                        <AppCard
                            key={app.id}
                            app={app}
                            onEdit={(a) => setFormState({ mode: "edit", app: a })}
                            onDelete={(a) => setAppToDelete(a)}
                        />
                    ))}
                </div>
            )}

            {formState && (
                <AppFormDialog
                    open={!!formState}
                    onOpenChange={(open) => !open && setFormState(null)}
                    mode={formState.mode}
                    defaultValues={formState.app}
                />
            )}

            {appToDelete && (
                <DeleteAppDialog
                    open={!!appToDelete}
                    onOpenChange={(open) => !open && setAppToDelete(null)}
                    app={appToDelete}
                />
            )}
        </Main>
    );
}

export default Apps;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/index.tsx`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/index.tsx
git commit -m "feat(apps): add Apps page with CRUD grid, empty/loading/error states"
```

---

### Task 11: Routing + sidebar navigation

**Files:**
- Create: `src/pages/Dashboard/AppsPage.tsx`
- Modify: `src/AppRouter.tsx`
- Modify: `src/components/layout/data/sidebar-data.ts`

**Interfaces:**
- Consumes: `Apps` default export from `src/feature/apps/index.tsx` (Task 10).
- Produces: route `/dashboard/apps`, sidebar nav item "Apps".

- [ ] **Step 1: Write the page wrapper**

```tsx
// src/pages/Dashboard/AppsPage.tsx
import Apps from "@/feature/apps";

export default function AppsPage() {
    return (
        <Apps />
    );
}
```

- [ ] **Step 2: Add the route**

In `src/AppRouter.tsx`, add the import near the other page imports:

```ts
import AppsPage from "@/pages/Dashboard/AppsPage.tsx";
```

Then add a route entry as a sibling of the `'tools'` route (inside the `/dashboard` children array):

```ts
            {
                path: 'apps',
                element: <AppsPage/>
            },
```

- [ ] **Step 3: Add the sidebar nav item**

In `src/components/layout/data/sidebar-data.ts`, add the `Boxes` icon to the lucide import list:

```ts
import {
    BookOpen,
    Boxes,
    Hammer,
    LayoutDashboardIcon,
    ListTree, MousePointerClickIcon, Palette, Server, Settings,
    UserCog,
    UsersIcon, Wrench
} from "lucide-react";
```

Then add an entry in the `'General'` group's `items` array, after `Dashboard` and before `Tools`:

```ts
                {
                    title: 'Apps',
                    url: '/dashboard/apps',
                    icon: Boxes,
                },
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 5: Lint**

Run: `npx eslint src/pages/Dashboard/AppsPage.tsx src/AppRouter.tsx src/components/layout/data/sidebar-data.ts`
Expected: `No issues found`

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open the app in a browser, log in, confirm:
- Sidebar shows "Apps" between "Dashboard" and "Tools".
- Clicking it navigates to `/dashboard/apps` and shows the seeded apps (6 cards from Task 2's seed data) in a grid.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Dashboard/AppsPage.tsx src/AppRouter.tsx src/components/layout/data/sidebar-data.ts
git commit -m "feat(apps): wire up /dashboard/apps route and sidebar entry"
```

---

### Task 12: Couple AppStoreMetricsCard to the registry

**Files:**
- Modify: `src/feature/dashboard/business/AppStoreMetricsCard.tsx`

**Interfaces:**
- Consumes: `useAppList` from `src/api/apps/hooks.ts` (Task 4).
- Produces: same rendered component, now data-driven from the registry instead of the removed `appMetrics` demo array.

**Current file content (for reference, to be replaced):**
```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Star, Download } from "lucide-react";
import { appMetrics } from "@/feature/dashboard/business/demoData.ts";
// ... renders appMetrics.map(...)
```

- [ ] **Step 1: Rewrite the component to source from the registry**

```tsx
// src/feature/dashboard/business/AppStoreMetricsCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Star, Download } from "lucide-react";
import { useAppList } from "@/api/apps/hooks.ts";

function formatEuro(value: number): string {
    return `${value.toLocaleString("de-DE")} €`;
}

export function AppStoreMetricsCard() {
    const appList = useAppList();
    const apps = (appList.data ?? []).filter((app) => app.category === "app-store");

    return (
        <Card>
            <CardHeader>
                <CardTitle>App Store Metrics</CardTitle>
                <CardDescription>Downloads & Revenue pro App</CardDescription>
            </CardHeader>
            <CardContent>
                {apps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Noch keine App-Store-Apps angelegt. Füge welche unter „Apps" hinzu.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {apps.map((app) => (
                            <li key={app.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{app.name}</p>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                        {app.metrics?.downloads !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Download className="h-3.5 w-3.5" />
                                                {app.metrics.downloads.toLocaleString("de-DE")}
                                            </span>
                                        )}
                                        {app.metrics?.rating !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 text-amber-500" />
                                                {app.metrics.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="font-medium tabular-nums">
                                    {formatEuro(app.metrics?.revenue ?? 0)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/dashboard/business/AppStoreMetricsCard.tsx`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/dashboard/business/AppStoreMetricsCard.tsx
git commit -m "refactor(dashboard): source AppStoreMetricsCard from app registry"
```

---

### Task 13: Couple BusinessSummaryKpis to the registry

**Files:**
- Modify: `src/feature/dashboard/business/BusinessSummaryKpis.tsx`

**Interfaces:**
- Consumes: `useAppList` from `src/api/apps/hooks.ts` (Task 4); `totalRevenueThisMonth`, `totalOpenInvoiceAmount` from `demoData.ts` (unchanged, kept in Task 15).
- Produces: same rendered component; "App Store Revenue" and "Trackspire MRR" KPI values now derived from the registry.

- [ ] **Step 1: Rewrite the component**

```tsx
// src/feature/dashboard/business/BusinessSummaryKpis.tsx
import { KpiCard } from "@/components/KpiCard.tsx";
import { Wallet, TrendingUp, Smartphone, FileWarning } from "lucide-react";
import { useAppList } from "@/api/apps/hooks.ts";
import { totalRevenueThisMonth, totalOpenInvoiceAmount } from "@/feature/dashboard/business/demoData.ts";

const euroFormatter = (value: number) => `${value.toLocaleString("de-DE")} €`;

export function BusinessSummaryKpis() {
    const appList = useAppList();
    const apps = appList.data;

    const appStoreRevenue = apps
        ? apps.filter((app) => app.category === "app-store").reduce((sum, app) => sum + (app.metrics?.revenue ?? 0), 0)
        : undefined;

    const trackspireApp = apps?.find((app) => app.category === "saas" && app.name === "Trackspire");
    const trackspireMrr = apps ? (trackspireApp?.metrics?.mrr ?? 0) : undefined;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Umsatz diesen Monat"
                value={totalRevenueThisMonth()}
                valueFormatter={euroFormatter}
                icon={Wallet}
                iconBg="bg-emerald-100 dark:bg-emerald-500/10"
                iconColor="text-emerald-600 dark:text-emerald-400"
            />
            <KpiCard
                title="Trackspire MRR"
                value={trackspireMrr}
                valueFormatter={euroFormatter}
                icon={TrendingUp}
                iconBg="bg-violet-100 dark:bg-violet-500/10"
                iconColor="text-violet-600 dark:text-violet-400"
            />
            <KpiCard
                title="App Store Revenue"
                value={appStoreRevenue}
                valueFormatter={euroFormatter}
                icon={Smartphone}
                iconBg="bg-sky-100 dark:bg-sky-500/10"
                iconColor="text-sky-600 dark:text-sky-400"
            />
            <KpiCard
                title="Offene Rechnungen"
                value={totalOpenInvoiceAmount()}
                valueFormatter={euroFormatter}
                icon={FileWarning}
                iconBg="bg-amber-100 dark:bg-amber-500/10"
                iconColor="text-amber-600 dark:text-amber-400"
            />
        </div>
    );
}
```

Note: `value={undefined}` while `apps` hasn't loaded yet renders `KpiCard`'s existing skeleton state (see `src/components/KpiCard.tsx` - `value !== undefined ? ... : <Skeleton />`), consistent with how `DashboardSummaryKpis` already behaves during loading.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/dashboard/business/BusinessSummaryKpis.tsx`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/dashboard/business/BusinessSummaryKpis.tsx
git commit -m "refactor(dashboard): derive App Store/Trackspire KPIs from app registry"
```

---

### Task 14: Couple TrackspireKpisCard header stats to the registry

**Files:**
- Modify: `src/feature/dashboard/business/TrackspireKpisCard.tsx`

**Interfaces:**
- Consumes: `useAppList` from `src/api/apps/hooks.ts` (Task 4); `trackspireMonthlyMrr` from `demoData.ts` (unchanged, kept in Task 15 - the chart stays a separate demo time series per spec, since apps carry no history).
- Produces: same rendered component; the three header numbers (MRR, Active Users, Churn) and the growth badge now come from the registry's Trackspire entry and the existing monthly series respectively.

- [ ] **Step 1: Rewrite the component**

```tsx
// src/feature/dashboard/business/TrackspireKpisCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart.tsx";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { chartColor } from "@/feature/dashboard/chartColor.ts";
import { trackspireMonthlyMrr } from "@/feature/dashboard/business/demoData.ts";
import { useAppList } from "@/api/apps/hooks.ts";

const chartConfig: ChartConfig = {
    mrr: { label: "MRR", color: chartColor[2] },
};

function monthlyMrrGrowthPercent(): number | undefined {
    if (trackspireMonthlyMrr.length < 2) return undefined;
    const current = trackspireMonthlyMrr[trackspireMonthlyMrr.length - 1].mrr;
    const previous = trackspireMonthlyMrr[trackspireMonthlyMrr.length - 2].mrr;
    if (previous === 0) return undefined;
    return Math.round(((current - previous) / previous) * 100);
}

export function TrackspireKpisCard() {
    const appList = useAppList();
    const trackspireApp = appList.data?.find((app) => app.category === "saas" && app.name === "Trackspire");
    const growthPercent = monthlyMrrGrowthPercent();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trackspire</CardTitle>
                <CardDescription>SaaS-KPIs (Demo-Zeitreihe für den Chart)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold tabular-nums">
                            {(trackspireApp?.metrics?.mrr ?? 0).toLocaleString("de-DE")} €
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            MRR{growthPercent !== undefined ? ` (${growthPercent >= 0 ? "+" : ""}${growthPercent}%)` : ""}
                        </p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{trackspireApp?.metrics?.activeUsers ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Aktive User</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{trackspireApp?.metrics?.churnPercent ?? 0}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Churn</p>
                    </div>
                </div>

                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart accessibilityLayer data={trackspireMonthlyMrr}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}€`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            dataKey="mrr"
                            type="monotone"
                            stroke={chartColor[2]}
                            strokeWidth={2}
                            dot={{ r: 4, fill: chartColor[2] }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/dashboard/business/TrackspireKpisCard.tsx`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/dashboard/business/TrackspireKpisCard.tsx
git commit -m "refactor(dashboard): derive Trackspire header KPIs from app registry"
```

---

### Task 15: Clean up demoData.ts (remove app-derived data)

**Files:**
- Modify: `src/feature/dashboard/business/demoData.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `demoData.ts` keeps only `MonthlyRevenueEntry`, `OpenInvoice`, `TrackspireMonthlyMrr` types, `monthlyRevenue`, `openInvoices`, `trackspireMonthlyMrr` data, and `totalRevenueThisMonth()`, `totalOpenInvoiceAmount()` functions. Removes `AppMetric` type, `appMetrics` data, `totalAppStoreRevenue()`, `trackspireStats`.

**Precondition check:** Tasks 12, 13, 14 must be committed first (they're the only consumers of the fields being removed) — run this before starting Step 1:

```bash
grep -rn "appMetrics\|totalAppStoreRevenue\|trackspireStats" src --include="*.tsx" --include="*.ts"
```
Expected: no matches outside `demoData.ts` itself.

- [ ] **Step 1: Rewrite the file**

```ts
// src/feature/dashboard/business/demoData.ts
/**
 * Platzhalter-Daten für die Business-Widgets, die (noch) nicht aus der
 * App-Registry ableitbar sind: monatliche Umsatz-Historie und offene
 * Rechnungen sind konzeptionell unabhängig von einzelnen Apps.
 */

export interface MonthlyRevenueEntry {
    month: string; // "Apr", "Mai", ...
    clientProjects: number;
    appStore: number;
    trackspire: number;
}

export interface OpenInvoice {
    id: string;
    client: string;
    amount: number;
    dueDate: string; // YYYY-MM-DD
}

export interface TrackspireMonthlyMrr {
    month: string;
    mrr: number;
}

export const monthlyRevenue: MonthlyRevenueEntry[] = [
    { month: "Apr", clientProjects: 1800, appStore: 420, trackspire: 650 },
    { month: "Mai", clientProjects: 2200, appStore: 380, trackspire: 780 },
    { month: "Jun", clientProjects: 1500, appStore: 510, trackspire: 890 },
    { month: "Jul", clientProjects: 2600, appStore: 460, trackspire: 1020 },
    { month: "Aug", clientProjects: 1900, appStore: 590, trackspire: 1150 },
    { month: "Sep", clientProjects: 2400, appStore: 640, trackspire: 1310 },
];

export const openInvoices: OpenInvoice[] = [
    { id: "inv-1", client: "Café Sonnenblick", amount: 850, dueDate: "2026-10-05" },
    { id: "inv-2", client: "Fitness Nord GmbH", amount: 1450, dueDate: "2026-10-12" },
    { id: "inv-3", client: "Atelier Weber", amount: 620, dueDate: "2026-09-28" },
];

export const trackspireMonthlyMrr: TrackspireMonthlyMrr[] = [
    { month: "Apr", mrr: 650 },
    { month: "Mai", mrr: 780 },
    { month: "Jun", mrr: 890 },
    { month: "Jul", mrr: 1020 },
    { month: "Aug", mrr: 1150 },
    { month: "Sep", mrr: 1310 },
];

export function totalRevenueThisMonth(): number {
    const current = monthlyRevenue[monthlyRevenue.length - 1];
    return current.clientProjects + current.appStore + current.trackspire;
}

export function totalOpenInvoiceAmount(): number {
    return openInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
}
```

- [ ] **Step 2: Type-check the whole project (catches any missed consumer of the removed exports)**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/dashboard/business/demoData.ts`
Expected: `No issues found`

- [ ] **Step 4: Commit**

```bash
git add src/feature/dashboard/business/demoData.ts
git commit -m "refactor(dashboard): drop app-derived fields from demoData now that apps come from the registry"
```

---

### Task 16: Full-branch verification

**Files:** none (verification only)

- [ ] **Step 1: Project-wide type-check**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 2: Project-wide lint**

Run: `npx eslint src`
Expected: `No issues found` (or pre-existing unrelated warnings only — do not introduce new ones)

- [ ] **Step 3: Start the dev server**

Run: `npm run dev` (background), note the printed local URL.

- [ ] **Step 4: Manual walkthrough — registry CRUD**

In the browser (log in first):
1. Navigate to `/dashboard/apps`. Confirm the 6 seeded apps render as cards (3 app-store, 1 saas, 2 client-website), each showing icon, name, category badge, status badge, and only the metrics fields that are set.
2. Click "Neue App". Fill in Name="Test Café Website", Category="Kundenwebseite", Status="Aktiv", leave metrics blank. Submit. Confirm a new card appears with no metrics row (Review Focus item 3) and a success toast.
3. Try submitting the form with URL `not-a-url` — confirm inline validation error appears and the app is not created (Review Focus item 4).
4. Click Edit on the new test card, change its name, save. Confirm the card updates in place.
5. Click Delete on the new test card, confirm in the dialog. Confirm the card disappears.
6. Delete all 3 app-store apps one by one. Confirm `AppStoreMetricsCard` on the Business tab of `/dashboard` shows its empty message and "App Store Revenue" KPI shows `0 €`, not a crash or `NaN` (Review Focus item 1).
7. Delete the Trackspire (saas) app. Confirm `TrackspireKpisCard` and the "Trackspire MRR" KPI show `0`/`0 €` fallbacks, not a crash (Review Focus item 2).
8. Re-create a saas app named "Trackspire" with category "app-store" first, then edit its category to "SaaS" and save — confirm it now shows correctly in the Trackspire card and disappears from `AppStoreMetricsCard` immediately after the edit (Review Focus item 5).

- [ ] **Step 5: Stop the dev server**

Kill the background `npm run dev` process.

- [ ] **Step 6: Final commit (only if manual verification surfaced fixes)**

If step 4 found bugs, fix them in the relevant task's file, re-run steps 1-2, then:

```bash
git add -A
git commit -m "fix(apps): address issues found in full-branch manual verification"
```

If no fixes were needed, this task produces no commit — just confirms everything already committed works end-to-end.

---

## Self-Review Notes

- **Spec coverage:** every spec section maps to a task — data model → Task 1; mock service layer → Tasks 2-4; UI/CRUD/empty state → Tasks 5-10; routing/nav → Task 11; business-widget coupling → Tasks 12-14; demoData cleanup → Task 15; error/loading/empty states → Tasks 7, 10, 12; seed data → Task 2.
- **Type consistency:** `AppEntity`/`AppInput`/`AppCategory`/`AppStatus`/`AppIconKey`/`AppMetrics` defined once in Task 1 and referenced by identical names in every later task; hook names (`useAppList`, `useApp`, `useCreateApp`, `useUpdateApp`, `useDeleteApp`) defined in Task 4 match usage in Tasks 8-10, 12-14 exactly.
- **Review Focus coverage:** all 5 items have an explicit verification step in Task 16 (steps 6-8) plus structural guards in the implementation itself (optional-chaining fallbacks in Tasks 12-14, the `metricEntries.length > 0` guard in Task 6, the URL regex refine in Task 8).
