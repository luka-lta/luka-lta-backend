# App Analytics Sources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each app in the App Registry an "analytics source" (App Store Connect / Firebase / custom / none) and a detail page that shows normalized demo analytics for that source, laying out the exact shape a future real backend would deliver after normalizing the underlying provider APIs.

**Architecture:** Same layering as the App Registry itself: `UI → hooks (react-query) → endpoints (async) → mock generator`. New pieces: `analyticsSchema.ts` (the single normalized shape all sources render through), `analyticsMock.ts` (fakes what a normalizing backend would produce), `analyticsEndpoints.ts` (the future real-API boundary), `useAppAnalytics` hook, and a new `/dashboard/apps/:appId` detail page with Overview/Analytics tabs (mirrors the existing `DetailLinktree` page).

**Tech Stack:** React, TypeScript, TanStack Query, Zod, react-hook-form, shadcn/ui (Dialog, Select, Tabs, Card, Badge, Skeleton, Alert, Empty), Recharts, react-router-dom, Luxon.

**Spec:** `docs/superpowers/specs/2026-09-30-app-analytics-sources-design.md`

## Global Constraints

- No test runner in this repo. Verification per task = `npx tsc -b` (NOT `npx tsc --noEmit`, which is a no-op here — root tsconfig has `files: []` and only project references) + `npx eslint <files>`, plus a final manual browser pass.
- This repo currently has exactly 4 pre-existing unrelated `tsc -b` errors (`src/api/utils.ts`, `src/components/kibo-ui/editor/index.tsx`, `src/components/markdown-editor/MarkdownEditor.tsx`, `src/components/Row.tsx`) — not touched by this plan, ignore them in every task's verification.
- `src/api/apps/*` and `src/feature/apps/*` use no-file-extension imports (e.g. `from "@/api/apps/schema"`). Match this convention for every new/modified file in this plan.
- Spaces only for indentation, never tabs.
- No `any` types.
- **The frontend must never branch on `analyticsSource` inside chart/KPI rendering logic** — it renders the normalized `AppAnalytics` shape generically. The only `analyticsSource === "none"` check allowed in the UI is the one that decides whether to render `NoAnalyticsState` instead of the chart/KPIs at all.
- `AppEntity`/`AppInput` gain a new required-with-default field (`analyticsSource`) — every existing literal `AppEntity` object in the codebase (the 6 seed apps in `mockStore.ts`) must be updated in the same task as the schema change, or the project won't type-check.

## Review Focus

- Deleting an app from its own detail page must navigate back to the list (not leave the user on a 404/error for a since-deleted app).
- Editing an app's `analyticsSource` away from a real source to `"none"` on the detail page's Analytics tab must immediately show `NoAnalyticsState` (query invalidation), not stale chart data.
- An app with `analyticsSource: "none"` must never trigger `fetchAppAnalytics`'s mock-generation path at all — the hook must not even attempt the query.
- The analytics chart/KPI values must be stable across re-renders/refetches for the same app within a session (deterministic mock), not a new random shape every time a component re-renders.
- Navigating to `/dashboard/apps/:appId` with an id that doesn't exist must show a clear error state, not a blank page or an unhandled exception.

---

## File Structure

```
src/api/apps/
  schema.ts              — modify: add AppAnalyticsSourceSchema + analyticsSource field (Task 1)
  mockStore.ts            — modify: seed apps get analyticsSource values (Task 1)
  analyticsSchema.ts      — new: normalized AppAnalytics shape (Task 2)
  analyticsMock.ts        — new: deterministic demo generator per source (Task 3)
  analyticsEndpoints.ts   — new: fetchAppAnalytics, the future real-API boundary (Task 4)
  hooks.ts                — modify: add useAppAnalytics (Task 5)

src/feature/apps/
  labels.ts                        — modify: add ANALYTICS_SOURCE_LABELS (Task 6)
  components/
    AppFormDialog.tsx              — modify: add analyticsSource select field (Task 7)
    AppCard.tsx                    — modify: header links to detail page (Task 8)
    DeleteAppDialog.tsx            — modify: add optional onDeleted callback (Task 12)
  detail/
    NoAnalyticsState.tsx           — new (Task 9)
    AnalyticsTab.tsx                — new (Task 10)
    AppOverviewTab.tsx              — new (Task 11)
    index.tsx                       — new: detail page assembly (Task 12)

src/pages/Dashboard/AppDetailPage.tsx  — new: route wrapper (Task 12)
src/AppRouter.tsx                       — modify: add apps/:appId route (Task 12)
```

---

### Task 1: Schema — analytics source enum + seed data

**Files:**
- Modify: `src/api/apps/schema.ts`
- Modify: `src/api/apps/mockStore.ts`

**Interfaces:**
- Produces: `AppAnalyticsSourceSchema`, type `AppAnalyticsSource`; `AppEntitySchema`/`AppInputSchema`/`AppEntity`/`AppInput` all now include `analyticsSource: AppAnalyticsSource`.

- [ ] **Step 1: Add the enum and field to schema.ts**

In `src/api/apps/schema.ts`, add after `AppStatusSchema` (before the icon-keys comment block):

```ts
export const AppAnalyticsSourceSchema = z.enum([
    "none",
    "app-store-connect",
    "firebase",
    "custom",
]);
```

Add `analyticsSource` to `AppEntitySchema`, right after `status`:

```ts
export const AppEntitySchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    icon: AppIconKeySchema,
    category: AppCategorySchema,
    status: AppStatusSchema,
    analyticsSource: AppAnalyticsSourceSchema.default("none"),
    url: z.string().url().optional(),
    metrics: AppMetricsSchema.optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
```

Add the exported type next to the other type exports at the bottom:

```ts
export type AppAnalyticsSource = z.infer<typeof AppAnalyticsSourceSchema>;
```

(Full type export block should now read `AppCategory`, `AppStatus`, `AppAnalyticsSource`, `AppIconKey`, `AppMetrics`, `AppEntity`, `AppInput` — keep alphabetical-ish grouping consistent with the existing order, just insert `AppAnalyticsSource` after `AppStatus`.)

- [ ] **Step 2: Update seed data in mockStore.ts**

In `src/api/apps/mockStore.ts`, add `analyticsSource` to each of the 6 seed objects (insert the line right after `status`):

- `app-pixeldiary`: `analyticsSource: "app-store-connect",`
- `app-focusflow`: `analyticsSource: "app-store-connect",`
- `app-tinybudget`: `analyticsSource: "app-store-connect",`
- `app-trackspire`: `analyticsSource: "firebase",`
- `app-cafe-sonnenblick`: `analyticsSource: "none",`
- `app-fitness-nord`: `analyticsSource: "none",`

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors, zero more (this catches any other literal `AppEntity` object in the codebase that would now be missing the field).

- [ ] **Step 4: Lint**

Run: `npx eslint src/api/apps/schema.ts src/api/apps/mockStore.ts`
Expected: no issues.

- [ ] **Step 5: Commit**

```bash
git add src/api/apps/schema.ts src/api/apps/mockStore.ts
git commit -m "feat(apps): add analyticsSource field to app entity"
```

---

### Task 2: Normalized analytics schema

**Files:**
- Create: `src/api/apps/analyticsSchema.ts`

**Interfaces:**
- Consumes: `AppAnalyticsSourceSchema` from `src/api/apps/schema.ts` (Task 1).
- Produces: `AppAnalyticsPointSchema`, `AppAnalyticsSchema`, types `AppAnalyticsPoint`, `AppAnalytics`.

- [ ] **Step 1: Write the schema file**

```ts
// src/api/apps/analyticsSchema.ts
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/analyticsSchema.ts`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/analyticsSchema.ts
git commit -m "feat(apps): add normalized analytics schema"
```

---

### Task 3: Deterministic mock analytics generator

**Files:**
- Create: `src/api/apps/analyticsMock.ts`

**Interfaces:**
- Consumes: `AppAnalyticsSource` from `src/api/apps/schema.ts` (Task 1); `AppAnalytics` from `src/api/apps/analyticsSchema.ts` (Task 2).
- Produces: `generateMockAnalytics(source: Exclude<AppAnalyticsSource, "none">, appId: string): AppAnalytics`. Used by Task 4.

- [ ] **Step 1: Write the generator**

```ts
// src/api/apps/analyticsMock.ts
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

export function generateMockAnalytics(source: Exclude<AppAnalyticsSource, "none">, appId: string): AppAnalytics {
    if (source === "app-store-connect") return generateAppStoreConnect(appId);
    if (source === "firebase") return generateFirebase(appId);
    return generateCustom(appId);
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/analyticsMock.ts`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/analyticsMock.ts
git commit -m "feat(apps): add deterministic mock analytics generator"
```

---

### Task 4: Analytics endpoints layer

**Files:**
- Create: `src/api/apps/analyticsEndpoints.ts`

**Interfaces:**
- Consumes: `generateMockAnalytics` from `src/api/apps/analyticsMock.ts` (Task 3); `AppAnalyticsSchema`, `AppAnalytics` from `src/api/apps/analyticsSchema.ts` (Task 2); `AppEntity` from `src/api/apps/schema.ts`.
- Produces: `fetchAppAnalytics(app: AppEntity): Promise<AppAnalytics | null>`. Used by Task 5.

- [ ] **Step 1: Write the endpoints file**

```ts
// src/api/apps/analyticsEndpoints.ts
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
export async function fetchAppAnalytics(app: AppEntity): Promise<AppAnalytics | null> {
    await delay(300);
    if (app.analyticsSource === "none") return null;
    return AppAnalyticsSchema.parse(generateMockAnalytics(app.analyticsSource, app.id));
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/analyticsEndpoints.ts`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/analyticsEndpoints.ts
git commit -m "feat(apps): add analytics endpoints layer"
```

---

### Task 5: `useAppAnalytics` hook

**Files:**
- Modify: `src/api/apps/hooks.ts`

**Interfaces:**
- Consumes: `fetchAppAnalytics` from `src/api/apps/analyticsEndpoints.ts` (Task 4); `AppEntity` from `src/api/apps/schema.ts`.
- Produces: `useAppAnalytics(app: AppEntity | undefined)`. Used by Task 10.

- [ ] **Step 1: Add the hook**

In `src/api/apps/hooks.ts`, add the import and the new hook (after `useApp`, before `useCreateApp`):

```ts
import { fetchAppAnalytics } from "@/api/apps/analyticsEndpoints";
```

```ts
export function useAppAnalytics(app: AppEntity | undefined) {
    return useQuery({
        queryKey: ["apps", "analytics", app?.id],
        queryFn: () => fetchAppAnalytics(app!),
        enabled: !!app,
    });
}
```

Also add `import type { AppEntity } from "@/api/apps/schema";` alongside the existing `import type { AppInput } from "@/api/apps/schema";` (combine into one import statement: `import type { AppEntity, AppInput } from "@/api/apps/schema";`).

**Note on Review Focus item 3** ("an app with `analyticsSource: 'none'` must never trigger the mock-generation path"): `enabled: !!app` only guards on whether an app object exists, not on its `analyticsSource`. This is correct here — the query still runs for a `"none"` app, but `fetchAppAnalytics` itself returns `null` immediately without calling `generateMockAnalytics` (see Task 4). Calling the endpoint is fine; generating fake data for a "none" source is what must never happen, and Task 4's early return already prevents that.

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/hooks.ts`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/hooks.ts
git commit -m "feat(apps): add useAppAnalytics hook"
```

---

### Task 6: Analytics source labels

**Files:**
- Modify: `src/feature/apps/labels.ts`

**Interfaces:**
- Consumes: `AppAnalyticsSource` from `src/api/apps/schema.ts` (Task 1).
- Produces: `ANALYTICS_SOURCE_LABELS: Record<AppAnalyticsSource, string>`. Used by Tasks 7 and 11.

- [ ] **Step 1: Add the label map**

In `src/feature/apps/labels.ts`, update the import line to:

```ts
import type { AppAnalyticsSource, AppCategory, AppStatus } from "@/api/apps/schema";
```

Add, after `STATUS_BADGE_CLASS`:

```ts
export const ANALYTICS_SOURCE_LABELS: Record<AppAnalyticsSource, string> = {
    none: "Keine",
    "app-store-connect": "App Store Connect",
    firebase: "Firebase",
    custom: "Eigene Quelle",
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/labels.ts`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/labels.ts
git commit -m "feat(apps): add analytics source labels"
```

---

### Task 7: AppFormDialog — analytics source field

**Files:**
- Modify: `src/feature/apps/components/AppFormDialog.tsx`

**Interfaces:**
- Consumes: `AppAnalyticsSourceSchema` from `src/api/apps/schema.ts` (Task 1); `ANALYTICS_SOURCE_LABELS` from `src/feature/apps/labels.ts` (Task 6).
- Produces: same component, form now includes and submits `analyticsSource`.

- [ ] **Step 1: Add the field to the form schema, defaults, and mappers**

In `src/feature/apps/components/AppFormDialog.tsx`:

1. Update the schema imports line to include `AppAnalyticsSourceSchema`:
   ```ts
   import { AppAnalyticsSourceSchema, AppCategorySchema, AppIconKeySchema, AppStatusSchema, type AppEntity, type AppInput } from "@/api/apps/schema";
   ```
2. Update the labels import to include `ANALYTICS_SOURCE_LABELS`:
   ```ts
   import { ANALYTICS_SOURCE_LABELS, CATEGORY_LABELS, STATUS_LABELS } from "@/feature/apps/labels";
   ```
3. Add `analyticsSource: AppAnalyticsSourceSchema,` to `appFormSchema`, right after `status: AppStatusSchema,`.
4. Add `analyticsSource: "none",` to `emptyFormValues`, right after `status: "active",`.
5. In `toFormValues`, add `analyticsSource: app.analyticsSource,` right after `status: app.status,`.
6. In `toAppInput`'s returned object, add `analyticsSource: values.analyticsSource,` right after `status: values.status,`.

- [ ] **Step 2: Add the Select field to the JSX**

Add a new field right after the Kategorie/Status `grid grid-cols-2` block and before the Icon field:

```tsx
<div className="space-y-1.5">
    <Label>Analytics-Quelle</Label>
    <Controller
        control={form.control}
        name="analyticsSource"
        render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {Object.entries(ANALYTICS_SOURCE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
    />
</div>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 4: Lint**

Run: `npx eslint src/feature/apps/components/AppFormDialog.tsx`
Expected: no issues.

- [ ] **Step 5: Commit**

```bash
git add src/feature/apps/components/AppFormDialog.tsx
git commit -m "feat(apps): add analytics source field to create/edit form"
```

---

### Task 8: AppCard — link to detail page

**Files:**
- Modify: `src/feature/apps/components/AppCard.tsx`

**Interfaces:**
- Consumes: `Link` from `react-router-dom` (existing project dependency, already used e.g. in `src/components/KpiCard.tsx`).
- Produces: same component; the icon/name/description block now navigates to `/dashboard/apps/${app.id}`.

- [ ] **Step 1: Wrap the header content in a Link**

In `src/feature/apps/components/AppCard.tsx`, add the import:

```ts
import { Link } from "react-router-dom";
```

Change the `CardHeader` content from a plain `<div>` to a `Link`:

```tsx
<CardHeader className="flex flex-row items-start justify-between gap-3">
    <Link to={`/dashboard/apps/${app.id}`} className="flex items-start gap-3 min-w-0 hover:opacity-80">
        <div className="rounded-lg bg-muted p-2 shrink-0">
            <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
            <p className="font-semibold truncate">{app.name}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
        </div>
    </Link>
</CardHeader>
```

(Only the outer `<div className="flex items-start gap-3 min-w-0">` becomes a `Link` with the same className plus `hover:opacity-80` — its children are unchanged.)

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/components/AppCard.tsx`
Expected: no issues.

- [ ] **Step 4: Manual sanity check (no dev server needed)**

Confirm by reading the file back that the Edit/Delete buttons in `CardFooter` are unaffected (still plain `Button` `onClick` handlers, not inside the new `Link`) — they must stay clickable independent of navigation.

- [ ] **Step 5: Commit**

```bash
git add src/feature/apps/components/AppCard.tsx
git commit -m "feat(apps): link AppCard header to detail page"
```

---

### Task 9: NoAnalyticsState component

**Files:**
- Create: `src/feature/apps/detail/NoAnalyticsState.tsx`

**Interfaces:**
- Consumes: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` from `@/components/ui/empty` (existing, used already by `EmptyAppsState`).
- Produces: `NoAnalyticsState` component, `Props: { onConfigure: () => void }`. Used by Task 10.

- [ ] **Step 1: Write the component**

```tsx
// src/feature/apps/detail/NoAnalyticsState.tsx
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { LineChart, Settings2 } from "lucide-react";

interface NoAnalyticsStateProps {
    onConfigure: () => void;
}

export function NoAnalyticsState({ onConfigure }: NoAnalyticsStateProps) {
    return (
        <Empty className="border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <LineChart />
                </EmptyMedia>
                <EmptyTitle>Keine Analytics-Quelle verbunden</EmptyTitle>
                <EmptyDescription>
                    Verbinde App Store Connect, Firebase oder eine eigene Quelle, um Analytics für diese App zu sehen.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button onClick={onConfigure}>
                    <Settings2 className="h-4 w-4" />
                    Quelle konfigurieren
                </Button>
            </EmptyContent>
        </Empty>
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/detail/NoAnalyticsState.tsx`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/detail/NoAnalyticsState.tsx
git commit -m "feat(apps): add no-analytics-source empty state"
```

---

### Task 10: AnalyticsTab component

**Files:**
- Create: `src/feature/apps/detail/AnalyticsTab.tsx`

**Interfaces:**
- Consumes: `useAppAnalytics` from `src/api/apps/hooks.ts` (Task 5); `AppEntity` from `src/api/apps/schema.ts`; `NoAnalyticsState` from `src/feature/apps/detail/NoAnalyticsState.tsx` (Task 9).
- Produces: `AnalyticsTab` component, `Props: { app: AppEntity; onConfigureSource: () => void }`. Used by Task 12.

- [ ] **Step 1: Write the component**

```tsx
// src/feature/apps/detail/AnalyticsTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useAppAnalytics } from "@/api/apps/hooks";
import type { AppEntity } from "@/api/apps/schema";
import { NoAnalyticsState } from "@/feature/apps/detail/NoAnalyticsState";

interface AnalyticsTabProps {
    app: AppEntity;
    onConfigureSource: () => void;
}

const ANALYTICS_CHART_COLOR = "#2980B9";

const chartConfig: ChartConfig = {
    value: { label: "Wert", color: ANALYTICS_CHART_COLOR },
};

function formatKpiValue(value: number, unit?: string): string {
    const formatted = value.toLocaleString("de-DE");
    return unit ? `${formatted}${unit === "%" || unit === "ms" ? unit : ` ${unit}`}` : formatted;
}

export function AnalyticsTab({ app, onConfigureSource }: AnalyticsTabProps) {
    const analytics = useAppAnalytics(app);

    if (app.analyticsSource === "none") {
        return <NoAnalyticsState onConfigure={onConfigureSource} />;
    }

    if (analytics.isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-72 w-full rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (analytics.isError) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Analytics konnten nicht geladen werden</AlertTitle>
                <AlertDescription className="flex items-center justify-between gap-4">
                    <span>{analytics.error.message}</span>
                    <Button variant="outline" size="sm" onClick={() => analytics.refetch()}>
                        Erneut versuchen
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    if (!analytics.data) {
        return <NoAnalyticsState onConfigure={onConfigureSource} />;
    }

    const { primaryMetric, kpis, breakdown } = analytics.data;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{primaryMetric.label}</CardTitle>
                    <CardDescription>Letzte 30 Tage (Demo-Daten)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                        <LineChart accessibilityLayer data={primaryMetric.series}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value: string) => value.slice(5)}
                            />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                dataKey="value"
                                type="monotone"
                                stroke={ANALYTICS_CHART_COLOR}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">{kpi.label}</p>
                            <p className="text-2xl font-bold tabular-nums mt-1">
                                {formatKpiValue(kpi.value, kpi.unit)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {breakdown && breakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Aufschlüsselung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {breakdown.map((entry) => (
                                <li key={entry.label} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{entry.label}</span>
                                    <span className="font-medium tabular-nums">{entry.value.toLocaleString("de-DE")}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/detail/AnalyticsTab.tsx`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/detail/AnalyticsTab.tsx
git commit -m "feat(apps): add generic analytics tab (chart + KPIs + breakdown)"
```

---

### Task 11: AppOverviewTab component

**Files:**
- Create: `src/feature/apps/detail/AppOverviewTab.tsx`

**Interfaces:**
- Consumes: `AppEntity` from `src/api/apps/schema.ts`; `getAppIcon` from `src/feature/apps/iconOptions.ts`; `CATEGORY_LABELS`, `STATUS_LABELS`, `STATUS_BADGE_CLASS`, `METRIC_LABELS`, `ANALYTICS_SOURCE_LABELS` from `src/feature/apps/labels.ts` (Task 6).
- Produces: `AppOverviewTab` component, `Props: { app: AppEntity }`. Used by Task 12.

- [ ] **Step 1: Write the component**

```tsx
// src/feature/apps/detail/AppOverviewTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppEntity } from "@/api/apps/schema";
import { ANALYTICS_SOURCE_LABELS, CATEGORY_LABELS, METRIC_LABELS, STATUS_BADGE_CLASS, STATUS_LABELS } from "@/feature/apps/labels";

interface AppOverviewTabProps {
    app: AppEntity;
}

function formatMetricValue(key: keyof NonNullable<AppEntity["metrics"]>, value: number): string {
    if (key === "revenue" || key === "mrr") return `${value.toLocaleString("de-DE")} €`;
    if (key === "rating") return value.toFixed(1);
    if (key === "churnPercent") return `${value}%`;
    return value.toLocaleString("de-DE");
}

export function AppOverviewTab({ app }: AppOverviewTabProps) {
    const metricEntries = app.metrics
        ? (Object.entries(app.metrics) as [keyof NonNullable<AppEntity["metrics"]>, number | undefined][])
            .filter((entry): entry is [keyof NonNullable<AppEntity["metrics"]>, number] => entry[1] !== undefined)
        : [];

    return (
        <Card>
            <CardContent className="space-y-6 p-6">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Beschreibung</p>
                    <p>{app.description || "Keine Beschreibung hinterlegt."}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{CATEGORY_LABELS[app.category]}</Badge>
                    <Badge className={cn(STATUS_BADGE_CLASS[app.status])}>{STATUS_LABELS[app.status]}</Badge>
                    <Badge variant="outline">Analytics: {ANALYTICS_SOURCE_LABELS[app.analyticsSource]}</Badge>
                </div>

                {app.url && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">URL</p>
                        <a
                            href={app.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {app.url}
                        </a>
                    </div>
                )}

                {metricEntries.length > 0 && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Metriken</p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {metricEntries.map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-muted-foreground text-xs">{METRIC_LABELS[key]}</p>
                                    <p className="font-medium tabular-nums">{formatMetricValue(key, value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/feature/apps/detail/AppOverviewTab.tsx`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/feature/apps/detail/AppOverviewTab.tsx
git commit -m "feat(apps): add app overview tab for detail page"
```

---

### Task 12: Detail page assembly + routing

**Files:**
- Modify: `src/feature/apps/components/DeleteAppDialog.tsx`
- Create: `src/feature/apps/detail/index.tsx`
- Create: `src/pages/Dashboard/AppDetailPage.tsx`
- Modify: `src/AppRouter.tsx`

**Interfaces:**
- Consumes: `useApp`, `useAppAnalytics` (unused directly here, used inside `AnalyticsTab`) from `src/api/apps/hooks.ts`; `AppOverviewTab` (Task 11), `AnalyticsTab` (Task 10); `AppFormDialog`, `DeleteAppDialog` (existing, from the App Registry plan); `getAppIcon` from `iconOptions.ts`; `STATUS_BADGE_CLASS`, `STATUS_LABELS` from `labels.ts`.
- Produces: route `/dashboard/apps/:appId`; `DeleteAppDialog` gains an optional `onDeleted` callback.

- [ ] **Step 1: Add `onDeleted` to DeleteAppDialog**

In `src/feature/apps/components/DeleteAppDialog.tsx`, add the optional prop and call it after the success toast:

```tsx
interface DeleteAppDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    app: AppEntity
    onDeleted?: () => void
}

export function DeleteAppDialog({ open, onOpenChange, app, onDeleted }: DeleteAppDialogProps) {
    const deleteApp = useDeleteApp()

    function handleConfirm() {
        deleteApp.mutate(app.id, {
            onSuccess: () => {
                onOpenChange(false)
                toast.success('App gelöscht')
                onDeleted?.()
            },
            onError: (error) => toast.error(error.message),
        })
    }
    // ... rest unchanged
```

(Only the interface, the function signature's destructuring, and the `onSuccess` body change — everything else in the file stays as-is.)

- [ ] **Step 2: Write the detail page**

```tsx
// src/feature/apps/detail/index.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/api/apps/hooks";
import { getAppIcon } from "@/feature/apps/iconOptions";
import { STATUS_BADGE_CLASS, STATUS_LABELS } from "@/feature/apps/labels";
import { AppFormDialog } from "@/feature/apps/components/AppFormDialog";
import { DeleteAppDialog } from "@/feature/apps/components/DeleteAppDialog";
import { AppOverviewTab } from "@/feature/apps/detail/AppOverviewTab";
import { AnalyticsTab } from "@/feature/apps/detail/AnalyticsTab";

function AppDetail() {
    const { appId } = useParams();
    const navigate = useNavigate();
    const app = useApp(appId ?? "");
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    if (app.isLoading) {
        return (
            <Main>
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-72 w-full rounded-xl" />
            </Main>
        );
    }

    if (app.isError || !app.data) {
        return (
            <Main>
                <Alert variant="destructive">
                    <AlertTitle>App nicht gefunden</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{app.error?.message ?? "Diese App existiert nicht."}</span>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/apps")}>
                            Zurück zur Übersicht
                        </Button>
                    </AlertDescription>
                </Alert>
            </Main>
        );
    }

    const entity = app.data;
    const Icon = getAppIcon(entity.icon);

    return (
        <Main>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">{entity.name}</h1>
                            <Badge className={cn(STATUS_BADGE_CLASS[entity.status])}>{STATUS_LABELS[entity.status]}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">App-Details, Bearbeitung und Analytics.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => navigate("/dashboard/apps")}>
                        <ArrowLeft className="h-4 w-4" />
                        Zurück
                    </Button>
                    <Button variant="outline" onClick={() => setFormOpen(true)}>
                        <Pencil className="h-4 w-4" />
                        Bearbeiten
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                        Löschen
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="h-9">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <AppOverviewTab app={entity} />
                </TabsContent>

                <TabsContent value="analytics">
                    <AnalyticsTab app={entity} onConfigureSource={() => setFormOpen(true)} />
                </TabsContent>
            </Tabs>

            <AppFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                mode="edit"
                defaultValues={entity}
            />

            <DeleteAppDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                app={entity}
                onDeleted={() => navigate("/dashboard/apps")}
            />
        </Main>
    );
}

export default AppDetail;
```

Note: unlike the list page, `AppFormDialog`/`DeleteAppDialog` here are always mounted (not conditionally on a `formState`-style guard) since there is exactly one app (`entity`) for the whole page's lifetime — no stale-`defaultValues`-between-different-apps concern the list page had to solve. The 500ms-delayed-unmount pattern from the list page doesn't apply here because these dialogs never unmount at all while this page is open; only their `open` prop toggles, which Radix already animates correctly on its own.

- [ ] **Step 3: Write the route wrapper**

```tsx
// src/pages/Dashboard/AppDetailPage.tsx
import AppDetail from "@/feature/apps/detail";

export default function AppDetailPage() {
    return (
        <AppDetail />
    );
}
```

- [ ] **Step 4: Add the route**

In `src/AppRouter.tsx`, add the import near the other page imports:

```ts
import AppDetailPage from "@/pages/Dashboard/AppDetailPage.tsx";
```

Add a route entry as a sibling of the `'apps'` route (inside the `/dashboard` children array), right after it:

```ts
            {
                path: 'apps/:appId',
                element: <AppDetailPage/>
            },
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors.

- [ ] **Step 6: Lint**

Run: `npx eslint src/feature/apps/components/DeleteAppDialog.tsx src/feature/apps/detail/index.tsx src/pages/Dashboard/AppDetailPage.tsx src/AppRouter.tsx`
Expected: no issues.

- [ ] **Step 7: Commit**

```bash
git add src/feature/apps/components/DeleteAppDialog.tsx src/feature/apps/detail/index.tsx src/pages/Dashboard/AppDetailPage.tsx src/AppRouter.tsx
git commit -m "feat(apps): add app detail page with overview/analytics tabs and routing"
```

---

### Task 13: Full-branch verification

**Files:** none (verification only)

- [ ] **Step 1: Project-wide type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors, zero more.

- [ ] **Step 2: Project-wide lint**

Run: `npx eslint src/api/apps src/feature/apps src/pages/Dashboard/AppDetailPage.tsx src/AppRouter.tsx`
Expected: no issues.

- [ ] **Step 3: Start the dev server**

Run: `npm run dev` (background), note the printed local URL.

- [ ] **Step 4: Manual walkthrough**

In the browser (log in first):
1. Navigate to `/dashboard/apps`. Click an App Store app's name/icon (e.g. PixelDiary) — confirm it navigates to `/dashboard/apps/<id>`, not just opens the edit dialog.
2. On the detail page, confirm the header shows name/icon/status, and Overview tab shows description/category/status/URL/metrics/analytics-source badge.
3. Switch to the Analytics tab — confirm a line chart, 3 KPI cards, and a breakdown list render with plausible App-Store-Connect-flavored labels (Downloads, Impressions, Conversion-Rate, Crashes, country breakdown).
4. Go back, open Trackspire's detail page, Analytics tab — confirm Firebase-flavored labels (DAU, MAU, Retention, event breakdown) render instead — same component, different data, proving the generic renderer works.
5. Go back, open Café Sonnenblick's detail page (analyticsSource "none") — confirm the Analytics tab shows `NoAnalyticsState` with a "Quelle konfigurieren" button, and clicking it opens the edit dialog.
6. In that edit dialog, change Analytics-Quelle to "Eigene Quelle", save — confirm the Analytics tab immediately shows custom-flavored data (Requests, Latenz, Error-Rate, Uptime, endpoint breakdown) without a manual page reload (Review Focus item 2).
7. Change it back to "Keine" and save — confirm the tab reverts to `NoAnalyticsState`.
8. Click "Löschen" on a test app you don't mind losing for the session (or create a throwaway one via "Neue App" first, then delete it from its own detail page) — confirm it navigates back to `/dashboard/apps` after deletion (Review Focus item 1).
9. Manually navigate to `/dashboard/apps/does-not-exist` — confirm a clear "App nicht gefunden" error state renders, not a blank page or crash (Review Focus item 5).
10. Refresh the Analytics tab of an app with a real source a couple of times (or navigate away and back) — confirm the chart numbers stay the same each time within the session (Review Focus item 4 — deterministic mock).

- [ ] **Step 5: Stop the dev server**

Kill the background `npm run dev` process.

- [ ] **Step 6: Final commit (only if manual verification surfaced fixes)**

If step 4 found bugs, fix them in the relevant task's file, re-run steps 1-2, then:

```bash
git add -A
git commit -m "fix(apps): address issues found in analytics full-branch manual verification"
```

If no fixes were needed, this task produces no commit.

---

## Self-Review Notes

- **Spec coverage:** data model extension → Task 1; normalized format → Task 2; mock generator → Task 3; endpoints boundary → Task 4; hook → Task 5; labels → Task 6; form field → Task 7; card navigation → Task 8; empty state → Task 9; generic analytics renderer → Task 10; overview tab → Task 11; detail page + routing + delete-navigation → Task 12; manual verification of all 5 Review Focus items → Task 13.
- **Type consistency:** `AppAnalyticsSource`/`AppAnalytics`/`AppAnalyticsPoint` defined once (Tasks 1, 2) and referenced by identical names everywhere later; `useAppAnalytics(app: AppEntity | undefined)` signature from Task 5 matches its only call site in Task 10 exactly; `generateMockAnalytics(source, appId)` signature from Task 3 matches its only call site in Task 4.
- **Review Focus coverage:** item 1 (delete → navigate) verified structurally in Task 12 (`onDeleted={() => navigate(...)}`) and manually in Task 13 step 8; item 2 (source-change → immediate UI update) relies on `useUpdateApp`'s existing query invalidation of `["apps", "detail", id]` (already built in the App Registry plan) plus `AnalyticsTab`'s query key including `app.id` — verified manually in Task 13 step 6; item 3 (no mock-gen for "none") verified in Task 4's early return, called out explicitly in Task 5; item 4 (deterministic mock) verified by construction in Task 3's seeded RNG, spot-checked manually in Task 13 step 10; item 5 (unknown id → error state) built into Task 12's `app.isError || !app.data` branch, verified manually in Task 13 step 9.
