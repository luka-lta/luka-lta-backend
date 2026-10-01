# App Analytics Multi-Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single `analyticsSource` enum on an app with a list of `analyticsSources` configurations, each with a type (App Store Connect / Firebase / custom), an enabled flag, and generic credential fields — so one app can have multiple analytics integrations, and the UI already has a place to put the credentials a future real backend cron job would use to pull data automatically.

**Architecture:** This plan migrates an already-shipped single-source feature (branch `feature-61`, commits through `a4892bd`) to a multi-source model. Every file that currently reads `app.analyticsSource` gets updated to read `app.analyticsSources` (an array) instead. The mock/endpoint/hook layering stays the same shape — only the parameters change from "the app" to "the app + which source config". The `AppFormDialog`'s single Select becomes a small `useFieldArray`-managed sub-form for adding/removing/toggling source configs with their credential fields.

**Tech Stack:** React, TypeScript, TanStack Query, Zod, react-hook-form (`useFieldArray`), shadcn/ui (Dialog, Select, Switch, Textarea, Badge), Recharts, react-router-dom, Luxon.

**Spec:** `docs/superpowers/specs/2026-10-01-app-analytics-multi-source-design.md`

## Global Constraints

- No test runner in this repo. Verification per task = `npx tsc -b` (NOT `npx tsc --noEmit`, a no-op here) + `npx eslint <files>`, plus a final manual browser pass.
- This repo currently has exactly 4 pre-existing unrelated `tsc -b` errors (`src/api/utils.ts`, `src/components/kibo-ui/editor/index.tsx`, `src/components/markdown-editor/MarkdownEditor.tsx`, `src/components/Row.tsx`) — not touched by this plan, ignore them in every task's verification.
- Indentation in this codebase is file-local, not globally uniform: `src/api/apps/schema.ts`, `mockStore.ts`, `hooks.ts`, `analyticsEndpoints.ts`, and everything under `src/feature/apps/` use 4-space indentation; `src/api/apps/analyticsMock.ts` and `analyticsSchema.ts` use 2-space. When editing a file, match that file's existing indentation — do not reformat the whole file to a different width.
- `src/api/apps/*` and `src/feature/apps/*` use no-file-extension imports.
- No `any` types.
- **`src/AppRouter.tsx` is NOT touched by this plan** — no task in this plan needs to modify it. If any task's diff appears to need to touch it, stop and reconsider (this would indicate a planning error, not a legitimate need).
- `AppEntity`/`AppInput` are changing a required field's shape (`analyticsSource: AppAnalyticsSource` → `analyticsSources: AppAnalyticsSourceConfig[]`). Every existing literal `AppEntity` object in the codebase (the 6 seed apps in `mockStore.ts`) and every file reading the old field must be updated in lockstep — `npx tsc -b` across the whole project is the authoritative check that nothing was missed, run it after Task 1 and treat any new error outside the 4 known ones as a blocker.
- Credentials are plain-text demo placeholders stored in the in-memory mock store. No encryption, no masking beyond the input's own `type="password"` visual masking. This is explicitly out of scope per the spec — do not add encryption, hashing, or secure-storage logic.

## Review Focus

- An app with `analyticsSources: []` (or all entries `enabled: false`) must show `NoAnalyticsState` on its Analytics tab — not a crash, not a stale chart from before the spec change.
- Trackspire (seeded with two sources: app-store-connect + firebase) must show two distinct, independently-selectable pills on its Analytics tab, each loading genuinely different mock data — not the same data twice, not only one source reachable.
- Deleting a source config from the edit form, then saving, must make that source immediately disappear from the Analytics tab's pill list (query invalidation / prop flow), not linger until a manual refresh.
- Adding a second source to an app that only had one must make the newly added source immediately selectable and show its own distinct data — not silently overwrite or merge with the first.
- Switching the selected pill in the Analytics tab must not retain stale data from the previously selected source while the new one is loading — a brief loading state is fine, showing the old source's numbers under the new source's label is not.

---

## File Structure

```
src/api/apps/
  schema.ts              — modify: AppAnalyticsSourceSchema → AppAnalyticsSourceTypeSchema + AppAnalyticsSourceConfigSchema; AppEntitySchema field change (Task 1)
  mockStore.ts            — modify: seed apps use analyticsSources arrays, Trackspire gets two sources (Task 1)
  analyticsSchema.ts      — modify: AppAnalyticsSchema.source uses the new type enum (Task 2)
  analyticsMock.ts        — modify: generateMockAnalytics signature (type, seed) instead of (source, appId) (Task 3)
  analyticsEndpoints.ts   — modify: fetchAppAnalytics(app, sourceConfigId) (Task 4)
  hooks.ts                — modify: useAppAnalytics(app, sourceConfigId) (Task 5)

src/feature/apps/
  labels.ts                        — modify: ANALYTICS_SOURCE_LABELS → ANALYTICS_SOURCE_TYPE_LABELS, add credential field label maps (Task 6)
  components/
    AppFormDialog.tsx              — modify: replace single Select with useFieldArray source-config manager (Task 7)
  detail/
    AnalyticsTab.tsx                — modify: pill selector + per-source useAppAnalytics (Task 8)
    AppOverviewTab.tsx              — modify: multiple source badges (Task 9)
```

No new files in this plan — every task modifies an existing file from the already-shipped single-source feature.

---

### Task 1: Schema — multi-source config + seed data

**Files:**
- Modify: `src/api/apps/schema.ts`
- Modify: `src/api/apps/mockStore.ts`

**Interfaces:**
- Produces: `AppAnalyticsSourceTypeSchema` (replaces `AppAnalyticsSourceSchema`), type `AppAnalyticsSourceType`; `AppAnalyticsSourceConfigSchema`, type `AppAnalyticsSourceConfig`; `AppEntitySchema`/`AppInputSchema`/`AppEntity`/`AppInput` now have `analyticsSources: AppAnalyticsSourceConfig[]` instead of `analyticsSource: AppAnalyticsSource`.
- Removes: `AppAnalyticsSourceSchema`, `AppAnalyticsSource` type (the `"none"`-inclusive enum) — fully replaced, not kept alongside.

- [ ] **Step 1: Replace the enum and add the config schema in schema.ts**

In `src/api/apps/schema.ts`, replace the existing `AppAnalyticsSourceSchema` block:

```ts
export const AppAnalyticsSourceSchema = z.enum([
    "none",
    "app-store-connect",
    "firebase",
    "custom",
]);
```

with:

```ts
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
```

Change the `analyticsSource` line in `AppEntitySchema` from:

```ts
    analyticsSource: AppAnalyticsSourceSchema.default("none"),
```

to:

```ts
    analyticsSources: z.array(AppAnalyticsSourceConfigSchema).default([]),
```

Update the type export block: replace

```ts
export type AppAnalyticsSource = z.infer<typeof AppAnalyticsSourceSchema>;
```

with:

```ts
export type AppAnalyticsSourceType = z.infer<typeof AppAnalyticsSourceTypeSchema>;
export type AppAnalyticsSourceConfig = z.infer<typeof AppAnalyticsSourceConfigSchema>;
```

(keep this in the same position in the export list, right after `AppStatus`).

- [ ] **Step 2: Update seed data in mockStore.ts**

In `src/api/apps/mockStore.ts`, replace each seed app's `analyticsSource: "..."` line with an `analyticsSources: [...]` array, as follows:

`app-pixeldiary` — replace `analyticsSource: "app-store-connect",` with:
```ts
        analyticsSources: [
            {
                id: "src-pixeldiary-asc",
                type: "app-store-connect",
                enabled: true,
                credentials: { issuerId: "demo-issuer-123", keyId: "DEMO1234", privateKey: "-----BEGIN PRIVATE KEY-----\ndemo\n-----END PRIVATE KEY-----" },
            },
        ],
```

`app-focusflow` — replace `analyticsSource: "app-store-connect",` with:
```ts
        analyticsSources: [
            {
                id: "src-focusflow-asc",
                type: "app-store-connect",
                enabled: true,
                credentials: { issuerId: "demo-issuer-456", keyId: "DEMO5678", privateKey: "-----BEGIN PRIVATE KEY-----\ndemo\n-----END PRIVATE KEY-----" },
            },
        ],
```

`app-tinybudget` — replace `analyticsSource: "app-store-connect",` with:
```ts
        analyticsSources: [
            {
                id: "src-tinybudget-asc",
                type: "app-store-connect",
                enabled: true,
                credentials: { issuerId: "demo-issuer-789", keyId: "DEMO9012", privateKey: "-----BEGIN PRIVATE KEY-----\ndemo\n-----END PRIVATE KEY-----" },
            },
        ],
```

`app-trackspire` — replace `analyticsSource: "firebase",` with **two** sources (this is the multi-source demonstration app):
```ts
        analyticsSources: [
            {
                id: "src-trackspire-asc",
                type: "app-store-connect",
                enabled: true,
                credentials: { issuerId: "demo-issuer-trackspire", keyId: "DEMOTRACK", privateKey: "-----BEGIN PRIVATE KEY-----\ndemo\n-----END PRIVATE KEY-----" },
            },
            {
                id: "src-trackspire-firebase",
                type: "firebase",
                enabled: true,
                credentials: { projectId: "trackspire-prod", serviceAccountJson: "{\"type\":\"service_account\",\"demo\":true}" },
            },
        ],
```

`app-cafe-sonnenblick` — replace `analyticsSource: "none",` with `analyticsSources: [],`

`app-fitness-nord` — replace `analyticsSource: "none",` with `analyticsSources: [],`

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: more than the 4 known pre-existing errors at this point is EXPECTED and fine — every other file that reads `analyticsSource`/`AppAnalyticsSourceSchema`/`AppAnalyticsSource` (analyticsSchema.ts, analyticsMock.ts, analyticsEndpoints.ts, hooks.ts is unaffected, AppFormDialog.tsx, AnalyticsTab.tsx, AppOverviewTab.tsx) will now fail to compile until their own tasks fix them later in this plan. Confirm the NEW errors are all in exactly these files and are all about the renamed/restructured field — if you see an error anywhere else, stop and investigate before proceeding.

- [ ] **Step 4: Lint**

Run: `npx eslint src/api/apps/schema.ts src/api/apps/mockStore.ts`
Expected: no issues (lint doesn't see cross-file type errors, so this should pass even though other files are currently broken).

- [ ] **Step 5: Commit**

```bash
git add src/api/apps/schema.ts src/api/apps/mockStore.ts
git commit -m "feat(apps): replace single analyticsSource with analyticsSources array"
```

---

### Task 2: Normalized analytics schema — source type update

**Files:**
- Modify: `src/api/apps/analyticsSchema.ts`

**Interfaces:**
- Consumes: `AppAnalyticsSourceTypeSchema` from `src/api/apps/schema.ts` (Task 1).
- Produces: `AppAnalyticsSchema` (now using the type-only enum, no `"none"`), unchanged `AppAnalyticsPointSchema`/types otherwise.

**Precondition:** Task 1 must be committed first (this task consumes its renamed export).

- [ ] **Step 1: Update the import and the `source` field**

In `src/api/apps/analyticsSchema.ts`, change:

```ts
import { AppAnalyticsSourceSchema } from "@/api/apps/schema";
```

to:

```ts
import { AppAnalyticsSourceTypeSchema } from "@/api/apps/schema";
```

Change the `source` field and its comment from:

```ts
  // In practice never "none" - fetchAppAnalytics returns null for "none"
  // instead of an AppAnalytics object. Reuses the entity's source enum so
  // there is only one definition of what a "source" is.
  source: AppAnalyticsSourceSchema,
```

to:

```ts
  // Reuses the entity's source-type enum so there is only one definition
  // of what a source type is. An AppAnalytics object always belongs to one
  // concrete, enabled source config - fetchAppAnalytics returns null when
  // no matching enabled config exists, rather than ever modeling "no source"
  // as a value of this field.
  source: AppAnalyticsSourceTypeSchema,
```

Keep this file's existing 2-space indentation — do not reformat to 4-space.

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: the error(s) in this file from Task 1's step 3 are now gone. Remaining new errors should now only be in analyticsMock.ts, analyticsEndpoints.ts, AppFormDialog.tsx, AnalyticsTab.tsx, AppOverviewTab.tsx (plus the 4 known pre-existing ones).

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/analyticsSchema.ts`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/analyticsSchema.ts
git commit -m "refactor(apps): use source-type enum in normalized analytics schema"
```

---

### Task 3: Mock analytics generator — seed by source config, not app

**Files:**
- Modify: `src/api/apps/analyticsMock.ts`

**Interfaces:**
- Consumes: `AppAnalyticsSourceType` from `src/api/apps/schema.ts` (Task 1).
- Produces: `generateMockAnalytics(type: AppAnalyticsSourceType, seed: string): AppAnalytics`. Used by Task 4.

**Precondition:** Task 1 committed.

- [ ] **Step 1: Update the import and all parameter names/types**

In `src/api/apps/analyticsMock.ts`:

1. Change the import:
   ```ts
   import type { AppAnalyticsSource } from "@/api/apps/schema";
   ```
   to:
   ```ts
   import type { AppAnalyticsSourceType } from "@/api/apps/schema";
   ```

2. Rename every `appId` parameter in `buildSeries`, `generateAppStoreConnect`, `generateFirebase`, `generateCustom` to `seed` (purely a rename — the semantics are the same: a string that deterministically seeds the pseudo-random generator; it's just no longer guaranteed to be an app's id, it's now a source config's id). The seed suffixes inside each function (`` `${seed}-series` ``, `` `${seed}-asc` ``, etc.) stay structurally the same, just with the renamed variable.

3. Update the final dispatcher function's signature and body from:

```ts
export function generateMockAnalytics(
  source: Exclude<AppAnalyticsSource, "none">,
  appId: string
): AppAnalytics {
  if (source === "app-store-connect") return generateAppStoreConnect(appId);
  if (source === "firebase") return generateFirebase(appId);
  return generateCustom(appId);
}
```

to:

```ts
export function generateMockAnalytics(
  type: AppAnalyticsSourceType,
  seed: string
): AppAnalytics {
  if (type === "app-store-connect") return generateAppStoreConnect(seed);
  if (type === "firebase") return generateFirebase(seed);
  return generateCustom(seed);
}
```

Also update each `generate*` function's `source: "..."` field in its returned object — these stay the same literal values (`"app-store-connect"`, `"firebase"`, `"custom"`), no change needed there since the enum values themselves didn't change, only the type name did.

Keep this file's existing 2-space indentation.

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: errors in this file are now gone. Remaining: analyticsEndpoints.ts, AppFormDialog.tsx, AnalyticsTab.tsx, AppOverviewTab.tsx, plus the 4 known pre-existing ones.

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/analyticsMock.ts`
Expected: no issues.

- [ ] **Step 4: Self-review**

Confirm by reading the file back: calling `generateMockAnalytics("app-store-connect", "src-trackspire-asc")` and `generateMockAnalytics("firebase", "src-trackspire-firebase")` (the two Trackspire source ids from Task 1) must produce different `primaryMetric.series` values from each other (different seeds → different pseudo-random sequences) — this is the mechanism that makes Review Focus item 2 (two distinct sources on Trackspire) work.

- [ ] **Step 5: Commit**

```bash
git add src/api/apps/analyticsMock.ts
git commit -m "refactor(apps): seed mock analytics by source config id instead of app id"
```

---

### Task 4: Analytics endpoints — resolve by source config id

**Files:**
- Modify: `src/api/apps/analyticsEndpoints.ts`

**Interfaces:**
- Consumes: `generateMockAnalytics(type, seed)` from `src/api/apps/analyticsMock.ts` (Task 3); `AppAnalyticsSchema`, `AppAnalytics` from `src/api/apps/analyticsSchema.ts` (Task 2); `AppEntity` from `src/api/apps/schema.ts`.
- Produces: `fetchAppAnalytics(app: AppEntity, sourceConfigId: string): Promise<AppAnalytics | null>`. Used by Task 5.

**Precondition:** Tasks 1–3 committed.

- [ ] **Step 1: Rewrite the function**

Replace the full content of `src/api/apps/analyticsEndpoints.ts`'s `fetchAppAnalytics` function (keep the `delay` helper and the file's doc comment, just change the function body and signature):

```ts
export async function fetchAppAnalytics(app: AppEntity, sourceConfigId: string): Promise<AppAnalytics | null> {
    await delay(300);
    const sourceConfig = app.analyticsSources.find((s) => s.id === sourceConfigId && s.enabled);
    if (!sourceConfig) return null;
    return AppAnalyticsSchema.parse(generateMockAnalytics(sourceConfig.type, sourceConfig.id));
}
```

Keep this file's existing 4-space indentation.

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: errors in this file are now gone. Remaining: AppFormDialog.tsx, AnalyticsTab.tsx, AppOverviewTab.tsx, plus the 4 known pre-existing ones.

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/analyticsEndpoints.ts`
Expected: no issues.

- [ ] **Step 4: Self-review**

Confirm: passing a `sourceConfigId` that exists on the app but has `enabled: false` returns `null` (the `.find(... && s.enabled)` correctly excludes disabled sources) — this is the mechanism behind Review Focus item 1.

- [ ] **Step 5: Commit**

```bash
git add src/api/apps/analyticsEndpoints.ts
git commit -m "refactor(apps): resolve analytics by source config id, skip disabled sources"
```

---

### Task 5: `useAppAnalytics` hook — add source config id parameter

**Files:**
- Modify: `src/api/apps/hooks.ts`

**Interfaces:**
- Consumes: `fetchAppAnalytics(app, sourceConfigId)` from `src/api/apps/analyticsEndpoints.ts` (Task 4).
- Produces: `useAppAnalytics(app: AppEntity | undefined, sourceConfigId: string | undefined)`. Used by Task 8.

**Precondition:** Task 4 committed.

- [ ] **Step 1: Update the hook**

In `src/api/apps/hooks.ts`, replace:

```ts
export function useAppAnalytics(app: AppEntity | undefined) {
    return useQuery({
        queryKey: ["apps", "analytics", app?.id],
        queryFn: () => fetchAppAnalytics(app!),
        enabled: !!app,
    });
}
```

with:

```ts
export function useAppAnalytics(app: AppEntity | undefined, sourceConfigId: string | undefined) {
    return useQuery({
        queryKey: ["apps", "analytics", app?.id, sourceConfigId],
        queryFn: () => fetchAppAnalytics(app!, sourceConfigId!),
        enabled: !!app && !!sourceConfigId,
    });
}
```

Including `sourceConfigId` in the query key is what makes Review Focus item 5 work correctly: switching the selected source changes the query key, so TanStack Query treats it as a different query (shows its own loading state) rather than reusing stale cached data under a mismatched label.

- [ ] **Step 2: Type-check**

Run: `npx tsc -b`
Expected: no new errors here; errors should now only remain in AppFormDialog.tsx, AnalyticsTab.tsx, AppOverviewTab.tsx (plus the 4 known pre-existing ones) — these are fixed in Tasks 7-9.

- [ ] **Step 3: Lint**

Run: `npx eslint src/api/apps/hooks.ts`
Expected: no issues.

- [ ] **Step 4: Commit**

```bash
git add src/api/apps/hooks.ts
git commit -m "refactor(apps): useAppAnalytics takes an explicit source config id"
```

---

### Task 6: Labels — source type labels + credential field labels

**Files:**
- Modify: `src/feature/apps/labels.ts`

**Interfaces:**
- Consumes: `AppAnalyticsSourceType` from `src/api/apps/schema.ts` (Task 1).
- Produces: `ANALYTICS_SOURCE_TYPE_LABELS: Record<AppAnalyticsSourceType, string>` (replaces `ANALYTICS_SOURCE_LABELS`); `ANALYTICS_CREDENTIAL_FIELDS: Record<AppAnalyticsSourceType, { key: string; label: string; multiline?: boolean }[]>`. Used by Tasks 7, 8, 9.

**Precondition:** Task 1 committed.

- [ ] **Step 1: Update the type import**

Change:
```ts
import type { AppAnalyticsSource, AppCategory, AppStatus } from "@/api/apps/schema";
```
to:
```ts
import type { AppAnalyticsSourceType, AppCategory, AppStatus } from "@/api/apps/schema";
```

- [ ] **Step 2: Replace the label map and add the credential field map**

Replace:

```ts
export const ANALYTICS_SOURCE_LABELS: Record<AppAnalyticsSource, string> = {
    none: "Keine",
    "app-store-connect": "App Store Connect",
    firebase: "Firebase",
    custom: "Eigene Quelle",
};
```

with:

```ts
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
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: no new errors here. Remaining: AppFormDialog.tsx, AnalyticsTab.tsx, AppOverviewTab.tsx (all reference the now-removed `ANALYTICS_SOURCE_LABELS`/`AppAnalyticsSource` — fixed in Tasks 7-9), plus the 4 known pre-existing ones.

- [ ] **Step 4: Lint**

Run: `npx eslint src/feature/apps/labels.ts`
Expected: no issues.

- [ ] **Step 5: Commit**

```bash
git add src/feature/apps/labels.ts
git commit -m "refactor(apps): replace single-source labels with source-type and credential-field maps"
```

---

### Task 7: AppFormDialog — multi-source manager with credentials

**Files:**
- Modify: `src/feature/apps/components/AppFormDialog.tsx`

**Interfaces:**
- Consumes: `AppAnalyticsSourceTypeSchema` from `src/api/apps/schema.ts` (Task 1); `ANALYTICS_SOURCE_TYPE_LABELS`, `ANALYTICS_CREDENTIAL_FIELDS` from `src/feature/apps/labels.ts` (Task 6).
- Produces: same component, `analyticsSources` now managed via `useFieldArray` with an add-source sub-form.

**Precondition:** Tasks 1, 6 committed. This is the most structurally involved task in the plan — read carefully.

- [ ] **Step 1: Update imports**

Replace:
```ts
import { AppAnalyticsSourceSchema, AppCategorySchema, AppIconKeySchema, AppStatusSchema, type AppEntity, type AppInput } from "@/api/apps/schema";
```
with:
```ts
import { AppAnalyticsSourceTypeSchema, AppCategorySchema, AppIconKeySchema, AppStatusSchema, type AppEntity, type AppInput } from "@/api/apps/schema";
```

Replace:
```ts
import { ANALYTICS_SOURCE_LABELS, CATEGORY_LABELS, STATUS_LABELS } from "@/feature/apps/labels";
```
with:
```ts
import { ANALYTICS_CREDENTIAL_FIELDS, ANALYTICS_SOURCE_TYPE_LABELS, CATEGORY_LABELS, STATUS_LABELS } from "@/feature/apps/labels";
```

Add to the `react-hook-form` import line — change:
```ts
import { Controller, useForm } from "react-hook-form";
```
to:
```ts
import { Controller, useFieldArray, useForm } from "react-hook-form";
```

Add new UI imports (after the existing `Select` import line):
```ts
import { Switch } from "@/components/ui/switch";
```

- [ ] **Step 2: Update the form schema**

Replace the single field:
```ts
    analyticsSource: AppAnalyticsSourceSchema,
```
with an array field matching `AppAnalyticsSourceConfigSchema`'s shape (form-local, so credentials stay a plain string record — no per-key validation, matching the spec's "no required credential fields" decision):

```ts
    analyticsSources: z.array(z.object({
        id: z.string(),
        type: AppAnalyticsSourceTypeSchema,
        enabled: z.boolean(),
        credentials: z.record(z.string(), z.string()),
    })),
```

- [ ] **Step 3: Update defaults and mappers**

In `emptyFormValues`, replace `analyticsSource: "none",` with `analyticsSources: [],`.

In `toFormValues`, replace `analyticsSource: app.analyticsSource,` with `analyticsSources: app.analyticsSources,`.

In `toAppInput`'s returned object, replace `analyticsSource: values.analyticsSource,` with `analyticsSources: values.analyticsSources,`.

- [ ] **Step 4: Add the `useFieldArray` hook and local add-source state**

Inside the `AppFormDialog` function body, after the `const form = useForm<AppFormValues>({...})` block, add:

```ts
    const sourcesFieldArray = useFieldArray({ control: form.control, name: "analyticsSources" });
    const [addingSourceType, setAddingSourceType] = useState<z.infer<typeof AppAnalyticsSourceTypeSchema> | null>(null);
    const [newSourceCredentials, setNewSourceCredentials] = useState<Record<string, string>>({});
```

Add `useState` to the React import at the top of the file — change:
```ts
import { useEffect } from "react";
```
to:
```ts
import { useEffect, useState } from "react";
```

Add this handler function near `onSubmit` (before the `return (` of the component):

```ts
    function handleAddSource() {
        if (!addingSourceType) return;
        sourcesFieldArray.append({
            id: crypto.randomUUID(),
            type: addingSourceType,
            enabled: true,
            credentials: newSourceCredentials,
        });
        setAddingSourceType(null);
        setNewSourceCredentials({});
    }
```

Reset the add-source UI state whenever the dialog's existing `useEffect` resets the form — add these two lines inside the existing `useEffect` body, right after `form.reset(...)`:
```ts
        setAddingSourceType(null);
        setNewSourceCredentials({});
```

- [ ] **Step 5: Replace the Analytics-Quelle JSX block**

Replace the entire existing block:

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

with:

```tsx
                    <fieldset className="space-y-3 rounded-md border p-3">
                        <legend className="px-1 text-sm font-medium">Analytics-Quellen</legend>

                        {sourcesFieldArray.fields.length > 0 && (
                            <ul className="space-y-2">
                                {sourcesFieldArray.fields.map((field, index) => (
                                    <li key={field.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-sm font-medium truncate">
                                                {ANALYTICS_SOURCE_TYPE_LABELS[field.type]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Controller
                                                control={form.control}
                                                name={`analyticsSources.${index}.enabled`}
                                                render={({ field: enabledField }) => (
                                                    <Switch checked={enabledField.value} onCheckedChange={enabledField.onChange} />
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => sourcesFieldArray.remove(index)}
                                                aria-label="Quelle entfernen"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {addingSourceType ? (
                            <div className="space-y-3 rounded-md border border-dashed p-3">
                                <div className="space-y-1.5">
                                    <Label>Typ</Label>
                                    <Select value={addingSourceType} onValueChange={(v) => { setAddingSourceType(v as typeof addingSourceType); setNewSourceCredentials({}); }}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(ANALYTICS_SOURCE_TYPE_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {ANALYTICS_CREDENTIAL_FIELDS[addingSourceType].map((field) => (
                                    <div key={field.key} className="space-y-1.5">
                                        <Label htmlFor={`new-source-${field.key}`} className="text-xs">{field.label}</Label>
                                        {field.multiline ? (
                                            <Textarea
                                                id={`new-source-${field.key}`}
                                                rows={2}
                                                className="resize-none"
                                                value={newSourceCredentials[field.key] ?? ""}
                                                onChange={(e) => setNewSourceCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                            />
                                        ) : (
                                            <Input
                                                id={`new-source-${field.key}`}
                                                type="password"
                                                value={newSourceCredentials[field.key] ?? ""}
                                                onChange={(e) => setNewSourceCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                            />
                                        )}
                                    </div>
                                ))}

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => { setAddingSourceType(null); setNewSourceCredentials({}); }}>
                                        Abbrechen
                                    </Button>
                                    <Button type="button" size="sm" onClick={handleAddSource}>
                                        Hinzufügen
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAddingSourceType("app-store-connect")}
                            >
                                <Plus className="h-4 w-4" />
                                Quelle hinzufügen
                            </Button>
                        )}
                    </fieldset>
```

Add `Plus` and `Trash2` to the `lucide-react` import — this file currently has no lucide import; add:
```ts
import { Plus, Trash2 } from "lucide-react";
```
(place it with the other top-of-file imports, after the `zod` import).

- [ ] **Step 6: Type-check**

Run: `npx tsc -b`
Expected: errors in this file are now gone. Remaining: AnalyticsTab.tsx, AppOverviewTab.tsx, plus the 4 known pre-existing ones.

- [ ] **Step 7: Lint**

Run: `npx eslint src/feature/apps/components/AppFormDialog.tsx`
Expected: no issues.

- [ ] **Step 8: Self-review**

Confirm: `handleAddSource` generates a fresh `crypto.randomUUID()` per added source (never reuses an id), `sourcesFieldArray.remove(index)` actually removes the entry from form state (not just visually), and the `enabled` `Switch` is wired through `Controller` so toggling it updates `form` state (not local-only UI state that gets lost on submit).

- [ ] **Step 9: Commit**

```bash
git add src/feature/apps/components/AppFormDialog.tsx
git commit -m "feat(apps): replace single analytics-source select with multi-source manager and credentials"
```

---

### Task 8: AnalyticsTab — pill selector across sources

**Files:**
- Modify: `src/feature/apps/detail/AnalyticsTab.tsx`

**Interfaces:**
- Consumes: `useAppAnalytics(app, sourceConfigId)` from `src/api/apps/hooks.ts` (Task 5); `ANALYTICS_SOURCE_TYPE_LABELS` from `src/feature/apps/labels.ts` (Task 6).
- Produces: same component contract (`Props: { app: AppEntity; onConfigureSource: () => void }`), now renders a pill per enabled source and loads the selected one.

**Precondition:** Tasks 5, 6 committed.

**CRITICAL constraint carried over from the single-source plan:** the chart/KPI/breakdown rendering block must stay 100% generic — it must never branch on the concrete source `type`. The only type-aware code allowed is the pill label lookup (`ANALYTICS_SOURCE_TYPE_LABELS[source.type]`), which is a label lookup, not a rendering branch.

- [ ] **Step 1: Update imports and add pill state**

Add `useState` and `Badge`/`cn` imports:
```ts
import { useState } from "react";
```
```ts
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
```

Update:
```ts
import { NoAnalyticsState } from "@/feature/apps/detail/NoAnalyticsState";
```
to also import labels:
```ts
import { NoAnalyticsState } from "@/feature/apps/detail/NoAnalyticsState";
import { ANALYTICS_SOURCE_TYPE_LABELS } from "@/feature/apps/labels";
```

- [ ] **Step 2: Replace the none-check and add pill selection**

Replace:

```tsx
export function AnalyticsTab({ app, onConfigureSource }: AnalyticsTabProps) {
    const analytics = useAppAnalytics(app);

    if (app.analyticsSource === "none") {
        return <NoAnalyticsState onConfigure={onConfigureSource} />;
    }
```

with:

```tsx
export function AnalyticsTab({ app, onConfigureSource }: AnalyticsTabProps) {
    const enabledSources = app.analyticsSources.filter((s) => s.enabled);
    const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>(enabledSources[0]?.id);
    const activeSourceId = enabledSources.some((s) => s.id === selectedSourceId) ? selectedSourceId : enabledSources[0]?.id;
    const analytics = useAppAnalytics(app, activeSourceId);

    if (enabledSources.length === 0) {
        return <NoAnalyticsState onConfigure={onConfigureSource} />;
    }
```

(The `activeSourceId` fallback handles the case where the previously-selected source was just disabled/removed and no longer appears in `enabledSources` — it falls back to the first still-enabled source instead of querying a stale/missing id.)

- [ ] **Step 3: Add the pill bar above the existing content**

Immediately after the `if (enabledSources.length === 0) { ... }` block and before the `if (analytics.isLoading)` block, add:

```tsx
    const pillBar = (
        <div className="flex flex-wrap gap-2">
            {enabledSources.map((source) => (
                <button
                    key={source.id}
                    type="button"
                    onClick={() => setSelectedSourceId(source.id)}
                    className="focus:outline-none"
                >
                    <Badge
                        variant={source.id === activeSourceId ? "default" : "outline"}
                        className={cn("cursor-pointer", source.id === activeSourceId && "ring-2 ring-primary/30")}
                    >
                        {ANALYTICS_SOURCE_TYPE_LABELS[source.type]}
                    </Badge>
                </button>
            ))}
        </div>
    );
```

Then wrap the three remaining return branches (`isLoading`, `isError`, `!analytics.data`, and the success branch) so the pill bar renders above each of them. Concretely, change each of the four remaining `return (...)` statements in the function to render `pillBar` followed by the existing content, e.g. the loading branch becomes:

```tsx
    if (analytics.isLoading) {
        return (
            <div className="space-y-4">
                {pillBar}
                <Skeleton className="h-72 w-full rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            </div>
        );
    }
```

the error branch becomes:

```tsx
    if (analytics.isError) {
        return (
            <div className="space-y-4">
                {pillBar}
                <Alert variant="destructive">
                    <AlertTitle>Analytics konnten nicht geladen werden</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{analytics.error.message}</span>
                        <Button variant="outline" size="sm" onClick={() => analytics.refetch()}>
                            Erneut versuchen
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
```

the `!analytics.data` branch becomes:

```tsx
    if (!analytics.data) {
        return (
            <div className="space-y-4">
                {pillBar}
                <NoAnalyticsState onConfigure={onConfigureSource} />
            </div>
        );
    }
```

and the final success branch's outer `<div className="space-y-4">` gets `{pillBar}` as its first child, immediately before the existing `<Card>` for the chart:

```tsx
    return (
        <div className="space-y-4">
            {pillBar}
            <Card>
                {/* ... existing chart Card content, unchanged ... */}
```

Everything else in each branch (the Skeleton layout, the Alert content, the chart/KPI/breakdown JSX) stays exactly as it already is — only the `pillBar` insertion and the enclosing `<div className="space-y-4">` wrapper (added where a branch didn't already have one) change.

- [ ] **Step 4: Type-check**

Run: `npx tsc -b`
Expected: errors in this file are now gone. Remaining: AppOverviewTab.tsx, plus the 4 known pre-existing ones.

- [ ] **Step 5: Lint**

Run: `npx eslint src/feature/apps/detail/AnalyticsTab.tsx`
Expected: no issues.

- [ ] **Step 6: Self-review**

Search this file for any string comparison against `"app-store-connect"`, `"firebase"`, or `"custom"` beyond the `ANALYTICS_SOURCE_TYPE_LABELS[source.type]` lookup — there should be none. The chart/KPI/breakdown rendering must still be driven entirely by `primaryMetric`/`kpis`/`breakdown`, never by `source.type` directly.

- [ ] **Step 7: Commit**

```bash
git add src/feature/apps/detail/AnalyticsTab.tsx
git commit -m "feat(apps): add source-pill selector to analytics tab for multi-source apps"
```

---

### Task 9: AppOverviewTab — multiple source badges

**Files:**
- Modify: `src/feature/apps/detail/AppOverviewTab.tsx`

**Interfaces:**
- Consumes: `ANALYTICS_SOURCE_TYPE_LABELS` from `src/feature/apps/labels.ts` (Task 6).
- Produces: same component contract (`Props: { app: AppEntity }`), renders one badge per configured source instead of a single badge.

**Precondition:** Task 6 committed.

- [ ] **Step 1: Update the import**

Change:
```ts
import { ANALYTICS_SOURCE_LABELS, CATEGORY_LABELS, METRIC_LABELS, STATUS_BADGE_CLASS, STATUS_LABELS } from "@/feature/apps/labels";
```
to:
```ts
import { ANALYTICS_SOURCE_TYPE_LABELS, CATEGORY_LABELS, METRIC_LABELS, STATUS_BADGE_CLASS, STATUS_LABELS } from "@/feature/apps/labels";
```

- [ ] **Step 2: Replace the single analytics badge**

Replace:

```tsx
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{CATEGORY_LABELS[app.category]}</Badge>
                    <Badge className={cn(STATUS_BADGE_CLASS[app.status])}>{STATUS_LABELS[app.status]}</Badge>
                    <Badge variant="outline">Analytics: {ANALYTICS_SOURCE_LABELS[app.analyticsSource]}</Badge>
                </div>
```

with:

```tsx
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{CATEGORY_LABELS[app.category]}</Badge>
                    <Badge className={cn(STATUS_BADGE_CLASS[app.status])}>{STATUS_LABELS[app.status]}</Badge>
                    {app.analyticsSources.map((source) => (
                        <Badge key={source.id} variant="outline">
                            {ANALYTICS_SOURCE_TYPE_LABELS[source.type]}
                            {!source.enabled && " (deaktiviert)"}
                        </Badge>
                    ))}
                </div>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors, zero more — this was the last file with a lingering reference to the old single-source shape.

- [ ] **Step 4: Lint**

Run: `npx eslint src/feature/apps/detail/AppOverviewTab.tsx`
Expected: no issues.

- [ ] **Step 5: Commit**

```bash
git add src/feature/apps/detail/AppOverviewTab.tsx
git commit -m "feat(apps): show one badge per configured analytics source in overview tab"
```

---

### Task 10: Full-branch verification

**Files:** none (verification only)

- [ ] **Step 1: Project-wide type-check**

Run: `npx tsc -b`
Expected: exactly the 4 known pre-existing errors, zero more. This confirms every file that referenced the old `analyticsSource` field was found and migrated — there is no remaining compile-time reference anywhere in the project.

- [ ] **Step 2: Grep for any remaining old-shape references**

Run: `grep -rn "analyticsSource\b" src --include="*.tsx" --include="*.ts" | grep -v "analyticsSources"`
Expected: no output. (The earlier single-source plan had exactly these 6 files referencing the singular field: schema.ts, mockStore.ts, analyticsEndpoints.ts, AppFormDialog.tsx, AnalyticsTab.tsx, AppOverviewTab.tsx — all of which this plan's Tasks 1, 4, 7, 8, 9 should have migrated to the plural `analyticsSources`.)

- [ ] **Step 3: Project-wide lint**

Run: `npx eslint src/api/apps src/feature/apps`
Expected: no issues.

- [ ] **Step 4: Start the dev server**

Run: `npm run dev` (background), note the printed local URL.

- [ ] **Step 5: Manual walkthrough**

In the browser (log in first):
1. Navigate to `/dashboard/apps`, open PixelDiary's detail page, Overview tab — confirm exactly one "App Store Connect" badge shows (not "(deaktiviert)").
2. Switch to Analytics tab — confirm a single pill "App Store Connect" shows, pre-selected, with the existing App-Store-Connect-flavored chart/KPIs/breakdown rendering correctly (Downloads chart, Impressions/Conversion-Rate/Crashes, country breakdown) — functionally identical to before this plan, just now routed through a source config id instead of a bare enum.
3. Open Trackspire's detail page. Overview tab — confirm **two** badges show: "App Store Connect" and "Firebase". Analytics tab — confirm **two pills** show. Click each pill in turn and confirm each shows genuinely different data (different chart shape, different KPI labels — App Store Connect flavor vs Firebase flavor) — this is Review Focus item 2.
4. On Trackspire's Analytics tab, click rapidly between the two pills a few times — confirm there's no flash of the previous source's numbers under the new source's pill (Review Focus item 5; a brief skeleton during loading is fine).
5. Open Café Sonnenblick's detail page (no sources configured) — confirm Analytics tab shows `NoAnalyticsState`, and Overview tab shows no analytics badges at all.
6. Edit Café Sonnenblick: click "Quelle hinzufügen", select "Firebase", fill in Project ID and Service-Account-JSON (any text), click "Hinzufügen" inside the form, then save the dialog. Confirm: the Overview tab now shows a "Firebase" badge, and the Analytics tab shows a single Firebase pill with Firebase-flavored demo data (Review Focus item 4 — newly added source is immediately selectable and shows its own data).
7. Edit Café Sonnenblick again: toggle the Firebase source's enabled switch off, save. Confirm the Analytics tab now shows `NoAnalyticsState` again (disabled sources are excluded from `enabledSources`) — Review Focus item 1.
8. Edit Café Sonnenblick again: toggle Firebase back on, save, confirm the pill reappears with the same data as before (same source id → same deterministic seed).
9. Edit Café Sonnenblick once more: click the trash icon next to the Firebase source row to remove it entirely, save. Confirm it's gone from both Overview badges and the Analytics pill bar (Review Focus item 3).
10. Confirm `src/AppRouter.tsx` was not modified by this plan: run `git log --oneline -1 -- src/AppRouter.tsx` and confirm the most recent commit touching it predates this plan's first commit (i.e. this plan introduced no changes to that file, consistent with the Global Constraint).

- [ ] **Step 6: Stop the dev server**

Kill the background `npm run dev` process.

- [ ] **Step 7: Final commit (only if manual verification surfaced fixes)**

If step 5 found bugs, fix them in the relevant task's file, re-run steps 1-3, then:

```bash
git add -A
git commit -m "fix(apps): address issues found in multi-source analytics manual verification"
```

If no fixes were needed, this task produces no commit.

---

## Self-Review Notes

- **Spec coverage:** schema migration (type + config + array field) → Task 1; normalized-format source type → Task 2; mock generator reseeding → Task 3; endpoint resolving by source config id → Task 4; hook parameterization → Task 5; labels (type labels + credential field definitions) → Task 6; form's multi-source manager with credentials → Task 7; pill-based analytics tab → Task 8; multi-badge overview → Task 9; full verification incl. every Review Focus item → Task 10.
- **Type consistency:** `AppAnalyticsSourceType`/`AppAnalyticsSourceConfig` defined once in Task 1 and referenced by identical names in every later task; `generateMockAnalytics(type, seed)` from Task 3 matches its only call site in Task 4 exactly; `fetchAppAnalytics(app, sourceConfigId)` from Task 4 matches its only call site in Task 5; `useAppAnalytics(app, sourceConfigId)` from Task 5 matches its only call site in Task 8.
- **Review Focus coverage:** item 1 (empty/all-disabled → NoAnalyticsState) built into Task 8's `enabledSources.length === 0` check and Task 4's `.enabled` filter, verified manually in Task 10 step 7; item 2 (Trackspire's two distinct sources) verified by construction in Task 1's seed data + Task 3's distinct seeds, manually verified in Task 10 step 3; item 3 (deleting a source removes it from the UI) built into Task 7's `useFieldArray.remove` + Task 9's `.map` over `analyticsSources`, verified manually in Task 10 step 9; item 4 (newly added source immediately selectable) built into Task 7's `useFieldArray.append` + Task 8's `enabledSources[0]?.id` default selection, verified manually in Task 10 step 6; item 5 (no stale data on pill switch) built into Task 5's query key including `sourceConfigId`, verified manually in Task 10 step 4.
- **Global constraint check:** no task in this plan touches `src/AppRouter.tsx` — confirmed by file-structure review; Task 10 step 10 verifies this at execution time.
