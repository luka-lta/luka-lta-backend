# Linktree UX/UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Linktree feature (list, table, dialogs, detail page) to the same design system and UX quality as the Homelab dashboard, closing a real schema/edit-surface bug along the way.

**Architecture:** No new dependencies, no backend changes. Two new presentational components (`LinktreeHeader`, `LinktreeSummaryKpis`) modeled directly on their Homelab counterparts (`HomelabHeader`, `SummaryKpis`). One dead code path removed (`EditLinkSheet` + its `'edit'` dialog state). The detail page (`DetailLinktree`) gains its own local dialog state (decoupled from `links-context`) and a `Tabs` split. The edit form's schema is extended to match the deleted sheet's schema so no fields are lost.

**Tech Stack:** React, TypeScript, react-hook-form + zod, TanStack Table/Query, shadcn/ui, kibo-ui, recharts, react-router-dom.

**Spec:** `docs/superpowers/specs/2026-09-25-linktree-ux-overhaul-design.md`

## Global Constraints

- No backend/API changes — no new endpoints, no changed request shapes beyond adding query params the existing `fetchLinktreeList(filterData: Record<string, string>)` already forwards as-is.
- No new npm dependencies. Reuse existing shadcn/ui and kibo-ui components only.
- No test runner exists in this repo (`package.json` has no `test` script). Verification per task is `npx tsc --noEmit` (must show zero errors touching changed files) plus a described manual browser check — not unit tests.
- Keep existing German/English mix as-is (UI copy in this feature is English; don't introduce German strings).
- `LinkItemTypeSchema` (`feature/linktree/schema/LinktreeSchema.ts`) is unchanged — only the *edit form* schema (`LinkDetailEditSchema`) changes.

## Review Focus

- A link with `deactivated: true` but `isActive: true` (deactivated overrides active) — status pill, table Status column, and the new status filter must all treat "deactivated" as its own state, not fall through to "active". `ContainerStatusBadge`-equivalent logic already exists in `LinktreeTable`'s status cell (Task 4 must preserve it) and `LinkDetails` (unchanged) — the new `LinktreeSummaryKpis` and status filter are the new code that must get this right.
- Empty `description` (`null` or `""`) in the merged "Link" table column must fall back to a visible "No description" placeholder, not render blank or "null".
- Deleting a link from the detail page (new capability) must navigate back to `/dashboard/linktree` on success — if a user deletes the link they're currently viewing and the page doesn't navigate away, they're left looking at a stale detail view for a now-nonexistent link.
- The status filter Select must have a real "All" option that clears the filter — an easy off-by-one is defaulting to a state where no option represents "no filter", trapping the user.
- `EditForm`'s new `iconName` field, submitted through `useUpdateLink`, must send `null` (not `""`) when empty, matching `linkCreateSchema`'s `.nullable().default(null)` — sending `""` to a backend expecting a nullable icon name is a plausible silent-breakage point given `CreateLinkDialog` already has this exact nullable pattern to copy from.

---

## File Structure

New:
- `src/feature/linktree/components/LinktreeHeader.tsx` — page header: title, status pill, refresh button.
- `src/feature/linktree/components/LinktreeSummaryKpis.tsx` — KPI row: total/active/inactive/deactivated counts.

Modified:
- `src/feature/linktree/childPages/detail/schema/LinkDetailSchema.ts` — extend `LinkDetailEditSchema`.
- `src/feature/linktree/childPages/detail/components/form/EditForm.tsx` — add description + iconName fields.
- `src/feature/linktree/components/dialog/CreateLinkDialog.tsx` — no functional change, read for pattern reuse only (nullable string handling).
- `src/feature/linktree/context/links-context.tsx` — narrow `LinkDialogTypes`.
- `src/feature/linktree/components/LinksDialogs.tsx` — drop `EditLinkSheet` branch.
- `src/feature/linktree/components/LinktreeTable.tsx` — toolbar (status filter, drop refresh), merged Link column, Edit navigates.
- `src/feature/linktree/index.tsx` — wire in `LinktreeHeader` + `LinktreeSummaryKpis`.
- `src/feature/linktree/childPages/detail/components/DetailClickChart.tsx` — restyle + working time-range toggle.
- `src/feature/linktree/childPages/detail/DetailLinktree.tsx` — header quick actions + local dialog state + `Tabs`.

Deleted:
- `src/feature/linktree/components/sheet/EditLinkSheet.tsx`

---

### Task 1: Extend the edit schema and form to match the deleted sheet

**Files:**
- Modify: `src/feature/linktree/childPages/detail/schema/LinkDetailSchema.ts`
- Modify: `src/feature/linktree/childPages/detail/components/form/EditForm.tsx`

**Interfaces:**
- Consumes: `LinkItemTypeSchema` (`feature/linktree/schema/LinktreeSchema.ts`) — unchanged, has `description: string | null`, `iconName: string | null`.
- Produces: `LinkDetailEditTypeSchema` now `{ displayname: string; description: string | null; url: string; isActive: boolean; iconName: string | null }`, consumed by `useUpdateLink` (`src/api/linktree/hooks.ts`, untouched) and by Task 7's `DetailLinktree`.

- [ ] **Step 1: Extend `LinkDetailEditSchema`**

Replace the file's schema block:

```typescript
export const LinkDetailEditSchema = z.object({
    displayname: z.string().nonempty().min(1).max(255),
    description: z.string().nullable().default(null).transform((v) => (v ? v : null)),
    url: z.string().url(),
    isActive: z.boolean(),
    iconName: z.string().nullable().default(null).transform((v) => (v ? v : null)),
});
```

The `.transform((v) => (v ? v : null))` on `description`/`iconName` is load-bearing, not decorative: both fields render through plain `register()`/`Textarea`/`TextInput` (Step 3 below), which produce `""` when a user clears the field, never `null`. Without the transform, clearing either field would submit `""` instead of `null` — see Review Focus.

**Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no new errors in `LinkDetailSchema.ts` (errors elsewhere, if any, are pre-existing — grep the output for the filename to confirm this file is clean: `npx tsc --noEmit 2>&1 | grep LinkDetailSchema` should print nothing).

- [ ] **Step 3: Add description + iconName fields to `EditForm`**

In `EditForm.tsx`, add imports:

```typescript
import {Textarea} from "@/components/ui/textarea.tsx";
```

Update `defaultValues` in the `useForm` call:

```typescript
    const form = useForm<LinkDetailEditTypeSchema>({
        resolver: zodResolver(LinkDetailEditSchema),
        defaultValues: {
            displayname: initialData?.displayname || "",
            description: initialData?.description ?? null,
            url: initialData?.url || "",
            isActive: initialData?.isActive ?? true,
            iconName: initialData?.iconName ?? null,
        },
    });
```

Insert a Description field and an Icon field between the existing `displayname` and `url` `TextInput`s (after the `displayname` `TextInput`, before the `url` `TextInput`):

```tsx
                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="link-detail-edit-description">Description</Label>
                        <Textarea
                            id="link-detail-edit-description"
                            placeholder="Link description"
                            {...form.register('description')}
                        />
                    </div>
```

(No custom `onChange` needed — the schema's `.transform` from Step 1 normalizes `""` to `null` at submit time.)

After the `url` `TextInput`, before the `Separator`, add:

```tsx
                    <TextInput
                        name="iconName"
                        id="link-detail-edit-iconName"
                        label="Icon"
                        form={form}
                        type="text"
                        placeholder="FaGithub"
                    />
```

The `onSubmit` handler is unchanged — `editLink.mutate(data, ...)` already sends the whole form payload; `data` now includes `description`/`iconName` because the schema does.

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E "EditForm|LinkDetailSchema"`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/feature/linktree/childPages/detail/schema/LinkDetailSchema.ts src/feature/linktree/childPages/detail/components/form/EditForm.tsx
git commit -m "feat(linktree): add description and icon fields to detail edit form"
```

---

### Task 2: Delete the redundant Edit sheet and its dialog-type wiring

**Files:**
- Delete: `src/feature/linktree/components/sheet/EditLinkSheet.tsx`
- Modify: `src/feature/linktree/context/links-context.tsx`
- Modify: `src/feature/linktree/components/LinksDialogs.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `LinkDialogTypes = 'add' | 'delete' | 'deactivate' | 'activate'` (was previously also `'edit'`), used by `LinktreeTable` (Task 4) and `LinksDialogs`.

- [ ] **Step 1: Delete the sheet file and its directory if now empty**

```bash
rm /Users/lliebenthal/projects/luka-lta-backend/src/feature/linktree/components/sheet/EditLinkSheet.tsx
rmdir /Users/lliebenthal/projects/luka-lta-backend/src/feature/linktree/components/sheet 2>/dev/null || true
```

- [ ] **Step 2: Narrow `LinkDialogTypes` in `links-context.tsx`**

Change:

```typescript
type LinkDialogTypes =  'add' | 'edit' | 'delete' | 'deactivate' | 'activate'
```

to:

```typescript
type LinkDialogTypes =  'add' | 'delete' | 'deactivate' | 'activate'
```

- [ ] **Step 3: Drop the `EditLinkSheet` branch in `LinksDialogs.tsx`**

Remove the import:

```typescript
import EditLinkSheet from "@/feature/linktree/components/sheet/EditLinkSheet.tsx";
```

Remove the `<EditLinkSheet .../>` block (the last child inside the `{currentRow && (<>...</>)}` fragment, after `<ActivateLinkDialog .../>`).

- [ ] **Step 4: Verify the deletion doesn't break anything yet**

Run: `npx tsc --noEmit 2>&1 | grep -iE "linktree|EditLinkSheet"`
Expected: errors referencing `setOpen('edit')` in `LinktreeTable.tsx` (that call site still exists — fixed in Task 4). This is expected at this point in the plan; confirm the *only* linktree-related errors are about `'edit'` not being assignable to `LinkDialogTypes` in `LinktreeTable.tsx`.

- [ ] **Step 5: Commit**

```bash
git add -A src/feature/linktree/components/sheet src/feature/linktree/context/links-context.tsx src/feature/linktree/components/LinksDialogs.tsx
git commit -m "refactor(linktree): remove redundant EditLinkSheet, narrow dialog types"
```

(Task 4 fixes the resulting `LinktreeTable.tsx` compile error; that's expected and resolved before the branch is done.)

---

### Task 3: Build `LinktreeHeader` and `LinktreeSummaryKpis`

**Files:**
- Create: `src/feature/linktree/components/LinktreeHeader.tsx`
- Create: `src/feature/linktree/components/LinktreeSummaryKpis.tsx`

**Interfaces:**
- Consumes: `LinkItemTypeSchema[]` (the loaded page of links); `KpiCard` (`src/components/KpiCard.tsx`, unchanged); `Status`/`StatusIndicator`/`StatusLabel` (`src/components/ui/kibo-ui/status/index.tsx`, unchanged); `RefreshButton` (`src/components/refresh-button.tsx`, unchanged, takes `onRefresh: () => Promise<void>`).
- Produces: `LinktreeHeader(props: { links: LinkItemTypeSchema[]; onRefresh: () => Promise<void> })`, `LinktreeSummaryKpis(props: { links: LinkItemTypeSchema[] })` — both consumed by Task 5's `index.tsx`.

- [ ] **Step 1: Write `LinktreeHeader.tsx`**

```tsx
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/kibo-ui/status/index.tsx";
import { RefreshButton } from "@/components/refresh-button.tsx";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

interface LinktreeHeaderProps {
    links: LinkItemTypeSchema[];
    onRefresh: () => Promise<void>;
}

function needsAttentionCount(links: LinkItemTypeSchema[]): number {
    return links.filter((link) => link.deactivated || !link.isActive).length;
}

export function LinktreeHeader({ links, onRefresh }: LinktreeHeaderProps) {
    const attention = needsAttentionCount(links);
    const status = attention === 0 ? "online" : "degraded";

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">Links</h1>
                    <Status status={status}>
                        <StatusIndicator />
                        <StatusLabel>
                            {attention === 0 ? "All links active" : `${attention} need${attention === 1 ? "s" : ""} attention`}
                        </StatusLabel>
                    </Status>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">Manage your links here.</p>
            </div>
            <RefreshButton onRefresh={onRefresh} variant="outline" size="default" className="flex items-center gap-2" />
        </div>
    );
}
```

- [ ] **Step 2: Write `LinktreeSummaryKpis.tsx`**

```tsx
import { KpiCard } from "@/components/KpiCard.tsx";
import { CheckCircle2, Link as LinkIcon, PauseCircle, PowerOff } from "lucide-react";
import type { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";

interface LinktreeSummaryKpisProps {
    links: LinkItemTypeSchema[];
}

export function LinktreeSummaryKpis({ links }: LinktreeSummaryKpisProps) {
    const deactivated = links.filter((l) => l.deactivated).length;
    const active = links.filter((l) => !l.deactivated && l.isActive).length;
    const inactive = links.filter((l) => !l.deactivated && !l.isActive).length;

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
            <KpiCard title="Total links" value={links.length} icon={LinkIcon} iconBg="bg-sky-500/10" iconColor="text-sky-500" />
            <KpiCard title="Active" value={active} icon={CheckCircle2} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
            <KpiCard title="Inactive" value={inactive} icon={PauseCircle} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
            <KpiCard title="Deactivated" value={deactivated} icon={PowerOff} iconBg="bg-slate-500/10" iconColor="text-slate-500" />
        </div>
    );
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -E "LinktreeHeader|LinktreeSummaryKpis"`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/feature/linktree/components/LinktreeHeader.tsx src/feature/linktree/components/LinktreeSummaryKpis.tsx
git commit -m "feat(linktree): add LinktreeHeader and LinktreeSummaryKpis components"
```

---

### Task 4: Restyle `LinktreeTable` — merged column, status filter, Edit navigates

**Files:**
- Modify: `src/feature/linktree/components/LinktreeTable.tsx`

**Interfaces:**
- Consumes: `LinkItemTypeSchema` (unchanged); `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` (`src/components/ui/select.tsx`, unchanged); `useNavigate` (already imported).
- Produces: `LinktreeTable` keeps its existing public props (`links`, `maxPages`, `loading`, `setFilterData`) — no signature change, so `index.tsx` (Task 5) doesn't need to change how it calls this component.

- [ ] **Step 1: Add the `Select` import and a local status-filter state**

Add to imports:

```typescript
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
```

Inside `LinktreeTable`, after the existing `sorting` state:

```typescript
    const [statusFilter, setStatusFilter] = useState<string>("all");
```

- [ ] **Step 2: Send the status filter to `setFilterData` alongside the existing params**

In the existing `useEffect` that calls `setFilterData`, add a `status` key and add `statusFilter` to the dependency array:

```typescript
    useEffect(() => {
        setFilterData({
            page: String(page),
            pageSize: String(PAGE_SIZE),
            displayname: debouncedSearch,
            status: statusFilter === "all" ? "" : statusFilter,
            sortColumn: sorting[0]?.id ?? '',
            sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, statusFilter, sorting]);
```

This follows the exact pattern `displayname` already uses (an arbitrary key forwarded by `fetchLinktreeList` as a query param) — `fetchLinktreeList` already strips `"undefined"` values, and an empty string param is a no-op filter server-side in the common case; if the backend doesn't recognize `status`, it's ignored the same way an unrecognized query param would be, matching current behavior for any other unsupported filter key.

Also reset to page 1 when the status filter changes, same as search does — change the filter's `onValueChange` handler in Step 4 to call `setPage(1)` too (shown there).

- [ ] **Step 3: Merge Display Name + Description into one "Link" column**

Replace the two column definitions (`displayname` and `description`) with one:

```typescript
        col.accessor('displayname', {
            id: 'displayname',
            header: 'Link',
            enableSorting: true,
            cell: ({row}) => (
                <div className="flex items-center gap-2 min-w-0">
                    <Avatar>
                        <AvatarFallback>
                            {/* @ts-expect-error - iconName is a free-form string, not a keyof typeof Icons */}
                            <CustomFaIcon name={row.original.iconName ?? undefined}/>
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-medium truncate">{row.original.displayname}</p>
                        <LongText className="max-w-48 text-xs text-muted-foreground">
                            {row.original.description || "No description"}
                        </LongText>
                    </div>
                </div>
            ),
        }),
```

Remove the old `col.accessor('description', ...)` block entirely.

- [ ] **Step 4: Rebuild the toolbar — search + status Select + Clear, no Refresh (moved to header)**

Replace the toolbar `<div className="flex items-center justify-between gap-4">...</div>` block with:

```tsx
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"/>
                        <Input
                            placeholder="Search links..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="deactivated">Deactivated</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => { setSearchInput(""); setStatusFilter("all"); }}>
                        <FilterX className="h-4 w-4"/>
                        Clear
                    </Button>
                </div>
                <Button onClick={() => setOpen('add')}>
                    <Plus className="h-4 w-4"/>
                    New
                </Button>
            </div>
```

Remove the now-unused `RefreshButton` import and the `queryClient`/`useQueryClient` import/usage (no longer needed in this file — refresh lives in `LinktreeHeader` now, driven by `index.tsx`).

- [ ] **Step 5: Make "Edit" navigate instead of opening the sheet**

In the actions column's `DropdownMenuItem` for Edit, change:

```typescript
                            <DropdownMenuItem onClick={(event) => {
                                event.stopPropagation();
                                setOpen('edit');
                                setCurrentRow(link);
                            }}>
```

to:

```typescript
                            <DropdownMenuItem onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/dashboard/linktree/${link.id}`);
                            }}>
```

`setCurrentRow` is unused for Edit now but still used by Delete/Deactivate/Activate items below it — leave those as-is.

- [ ] **Step 6: Verify types compile and lint passes**

Run: `npx tsc --noEmit 2>&1 | grep -i linktree`
Expected: no output (this also resolves the Task 2 expected error about `'edit'`).

Run: `npx eslint src/feature/linktree/components/LinktreeTable.tsx`
Expected: no errors (an unused-import warning for `RefreshButton`/`useQueryClient` would mean Step 4's cleanup was incomplete — fix it).

- [ ] **Step 7: Commit**

```bash
git add src/feature/linktree/components/LinktreeTable.tsx
git commit -m "refactor(linktree): merge table columns, add status filter, Edit navigates to detail"
```

---

### Task 5: Wire `LinktreeHeader` + `LinktreeSummaryKpis` into the list page

**Files:**
- Modify: `src/feature/linktree/index.tsx`

**Interfaces:**
- Consumes: `LinktreeHeader`, `LinktreeSummaryKpis` (Task 3); existing `useLinktreeList` return shape (`[queryData, setFilterData]`, `queryData.refetch(): Promise<...>`).
- Produces: no new exports; this is the page entry point.

- [ ] **Step 1: Replace the bare title block with `LinktreeHeader` + `LinktreeSummaryKpis`**

```tsx
import {useLinktreeList} from "@/api/linktree/hooks.ts";
import LinktreeTable from "@/feature/linktree/components/LinktreeTable.tsx";
import {Main} from "@/components/layout/main.tsx";
import LinksProvider from "@/feature/linktree/context/links-context.tsx";
import LinksDialogs from "@/feature/linktree/components/LinksDialogs.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {ErrorState} from "@/components/error-state.tsx";
import {LinktreeHeader} from "@/feature/linktree/components/LinktreeHeader.tsx";
import {LinktreeSummaryKpis} from "@/feature/linktree/components/LinktreeSummaryKpis.tsx";

function Linktree() {
    const [linkList, setFilterData] = useLinktreeList();
    useSetPageTitle('Backend - Linktree Overview');

    if (linkList.error) {
        return (
            <div className='p-6'>
                <h2 className='text-2xl font-bold tracking-tight mb-4'>Links</h2>
                <ErrorState
                    title="Failed to load links"
                    message={linkList.error.message}
                    refetch={linkList.refetch}
                />
            </div>
        )
    }

    const links = linkList.data?.links ?? [];

    return (
        <Main>
            <LinksProvider>
                <LinktreeHeader links={links} onRefresh={async () => { await linkList.refetch(); }} />
                <LinktreeSummaryKpis links={links} />

                <LinktreeTable
                    links={links}
                    maxPages={linkList.data?.totalPages}
                    loading={linkList.isPending}
                    setFilterData={setFilterData}
                />

                <LinksDialogs />
            </LinksProvider>
        </Main>
    );
}

export default Linktree;
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep -i "feature/linktree/index"`
Expected: no output.

- [ ] **Step 3: Manual browser check**

Start the dev server (`npm run dev`), log in, navigate to `/dashboard/linktree`. Confirm:
- Header shows "Links" + a status pill ("All links active" or "N need attention") + a working Refresh button (spinner shows briefly, list re-fetches).
- KPI row shows four cards (Total/Active/Inactive/Deactivated) whose numbers sum correctly against the visible table rows.
- Status filter Select filters the table; "Clear" resets both search and status filter.
- Row's "Edit" dropdown item navigates to `/dashboard/linktree/<id>` (no sheet opens).
- Create/Delete/Deactivate/Activate dialogs still open and function from the table.

- [ ] **Step 4: Commit**

```bash
git add src/feature/linktree/index.tsx
git commit -m "feat(linktree): wire header and summary KPIs into list page"
```

---

### Task 6: Restyle `DetailClickChart` and wire the time-range toggle

**Files:**
- Modify: `src/feature/linktree/childPages/detail/components/DetailClickChart.tsx`

**Interfaces:**
- Consumes: nothing new (still self-contained mock data).
- Produces: `DetailClickChart` — no props, unchanged signature, consumed by Task 7's `DetailLinktree`.

- [ ] **Step 1: Add the `Tabs` time-range toggle and wire it to existing state**

Add import:

```typescript
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
```

Change the dead `const [timeRange] = useState("7d")` to a real setter:

```typescript
    const [timeRange, setTimeRange] = useState("7d")
```

Replace the `CardHeader` block:

```tsx
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>Clicks over time</CardTitle>
                    <CardDescription>Sample data — click tracking not yet connected</CardDescription>
                </div>
                <Tabs value={timeRange} onValueChange={setTimeRange}>
                    <TabsList className="h-8">
                        <TabsTrigger value="7d" className="text-xs px-2.5">7d</TabsTrigger>
                        <TabsTrigger value="30d" className="text-xs px-2.5">30d</TabsTrigger>
                        <TabsTrigger value="90d" className="text-xs px-2.5">90d</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
```

The existing `filteredData` computation already reads `timeRange` and branches on `"30d"`/`"7d"`/(default 90d) — no change needed there, it now actually receives different values.

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep DetailClickChart`
Expected: no output.

- [ ] **Step 3: Manual browser check**

Navigate to any link's detail page (route still `/dashboard/linktree/:linkId` — reachable directly via URL even before Task 7 rewires the Tabs shell, since `DetailClickChart` is still rendered by the current `DetailLinktree` at this point in the plan). Confirm clicking 7d/30d/90d changes the chart's data window and the active tab highlight.

- [ ] **Step 4: Commit**

```bash
git add src/feature/linktree/childPages/detail/components/DetailClickChart.tsx
git commit -m "feat(linktree): add working time-range toggle to click chart, label as sample data"
```

---

### Task 7: Restructure `DetailLinktree` — quick actions + Tabs

**Files:**
- Modify: `src/feature/linktree/childPages/detail/DetailLinktree.tsx`

**Interfaces:**
- Consumes: `EditForm` (Task 1, now takes `initialData?: LinkItemTypeSchema` unchanged), `DetailClickChart` (Task 6, no props), `LinkDetails`, `QrCodeDisplay` (unchanged), `DeleteLinkDialog`/`DeactivateLinkDialog`/`ActivateLinkDialog` (unchanged — each already takes `{open, onOpenChange, currentRow}` independent of `links-context`), `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`, `CopyButton`.
- Produces: no new exports; page entry point for the `:linkId` route.

- [ ] **Step 1: Add local dialog state and quick-action handlers**

Add imports:

```typescript
import {useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Status, StatusIndicator, StatusLabel} from "@/components/ui/kibo-ui/status/index.tsx";
import {CopyButton} from "@/components/CopyButton.tsx";
import {ExternalLink, Power, PowerOff, Trash} from "lucide-react";
import DeleteLinkDialog from "@/feature/linktree/components/dialog/DeleteLinkDialog.tsx";
import DeactivateLinkDialog from "@/feature/linktree/components/dialog/DeactivateLinkDialog.tsx";
import ActivateLinkDialog from "@/feature/linktree/components/dialog/ActivateLinkDialog.tsx";
```

Inside the component, after `const [linkDetail] = useLinkDetail(linkId);`:

```typescript
    const [openDialog, setOpenDialog] = useState<'delete' | 'deactivate' | 'activate' | null>(null);
```

- [ ] **Step 2: Rebuild the header with status pill + quick actions**

Replace the header block (the `<div className="flex flex-wrap items-center justify-between gap-4 mb-6">...</div>`) with:

```tsx
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{link?.displayname}</h1>
                        {link && (
                            link.deactivated ? (
                                <Status status="maintenance">
                                    <StatusIndicator/>
                                    <StatusLabel>Deactivated</StatusLabel>
                                </Status>
                            ) : (
                                <Status status={link.isActive ? "online" : "offline"}>
                                    <StatusIndicator/>
                                    <StatusLabel>{link.isActive ? "Active" : "Inactive"}</StatusLabel>
                                </Status>
                            )
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1">Link details, editing and click history.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/dashboard/linktree')}>
                        <ArrowLeft className="h-4 w-4"/>
                        Back
                    </Button>
                    {link?.url && (
                        <Button variant="outline" onClick={() => window.open(link.url, "_blank")}>
                            <ExternalLink className="h-4 w-4"/>
                            Visit
                        </Button>
                    )}
                    {link?.url && <CopyButton value={link.url}/>}
                    {link && (link.deactivated ? (
                        <Button variant="outline" onClick={() => setOpenDialog('activate')}>
                            <Power className="h-4 w-4"/>
                            Activate
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => setOpenDialog('deactivate')}>
                            <PowerOff className="h-4 w-4"/>
                            Deactivate
                        </Button>
                    ))}
                    <Button variant="destructive" onClick={() => setOpenDialog('delete')}>
                        <Trash className="h-4 w-4"/>
                        Delete
                    </Button>
                </div>
            </div>
```

- [ ] **Step 3: Replace the 2-column grid with `Tabs`**

Replace the `<div className="grid gap-4 lg:grid-cols-3 items-start">...</div>` block with:

```tsx
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="h-9">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-4 lg:grid-cols-3 items-start">
                        <div className="lg:col-span-2">
                            <EditForm initialData={link}/>
                        </div>
                        <div className="space-y-4">
                            <LinkDetails link={link!}/>
                            <QrCodeDisplay link={link?.url ?? ''}/>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics">
                    <DetailClickChart/>
                </TabsContent>
            </Tabs>
```

- [ ] **Step 4: Mount the three dialogs, wired to local state, with navigate-away on delete**

Immediately before the closing `</Main>`, add:

```tsx
            {link && (
                <>
                    <DeleteLinkDialog
                        open={openDialog === 'delete'}
                        onOpenChange={(open) => {
                            setOpenDialog(open ? 'delete' : null);
                            if (!open) return;
                        }}
                        currentRow={link}
                    />
                    <DeactivateLinkDialog
                        open={openDialog === 'deactivate'}
                        onOpenChange={(open) => setOpenDialog(open ? 'deactivate' : null)}
                        currentRow={link}
                    />
                    <ActivateLinkDialog
                        open={openDialog === 'activate'}
                        onOpenChange={(open) => setOpenDialog(open ? 'activate' : null)}
                        currentRow={link}
                    />
                </>
            )}
```

`DeleteLinkDialog` already calls `onOpenChange(false)` in its own `onSuccess` (see `DeleteLinkDialog.tsx`) — that alone closes the dialog but does not navigate away. Add navigation on successful delete by passing a `onOpenChange` that also redirects: replace the `DeleteLinkDialog` block above with:

```tsx
                    <DeleteLinkDialog
                        open={openDialog === 'delete'}
                        onOpenChange={(open) => {
                            setOpenDialog(open ? 'delete' : null);
                            if (!open) navigate('/dashboard/linktree');
                        }}
                        currentRow={link}
                    />
```

This works because `DeleteLinkDialog` calls `onOpenChange(false)` only on successful deletion (see its `handleConfirm`/`onSuccess`) or when the user cancels/closes the `AlertDialog` — in both cases returning to the list is the correct behavior (cancel: user already chose Back-equivalent; success: link no longer exists).

- [ ] **Step 5: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | grep DetailLinktree`
Expected: no output.

- [ ] **Step 6: Manual browser check**

Navigate to a link's detail page. Confirm:
- Status pill in the header matches the link's actual state (test with an active, an inactive, and a deactivated link if available).
- "Visit" opens the URL in a new tab; the copy button next to it copies the URL.
- Deactivate/Activate button (whichever applies) opens the correct confirm dialog and toggles state on confirm.
- Delete opens the confirm dialog; canceling stays on the page; confirming deletes and navigates back to `/dashboard/linktree`.
- "Overview" tab shows the edit form (now with description + icon fields from Task 1) plus the meta card and QR code; "Analytics" tab shows the click chart with the working time-range toggle from Task 6.
- Editing and saving a field works end-to-end (toast on success, form's dirty state resets).

- [ ] **Step 7: Commit**

```bash
git add src/feature/linktree/childPages/detail/DetailLinktree.tsx
git commit -m "feat(linktree): restructure detail page with quick actions and Overview/Analytics tabs"
```

---

### Task 8: Full-branch consistency pass

**Files:**
- Read-only review of all files touched in Tasks 1–7 (no new files).

**Interfaces:**
- Consumes: everything produced above.
- Produces: nothing new — this task is verification only.

- [ ] **Step 1: Typecheck and lint the whole project**

Run: `npx tsc --noEmit`
Expected: zero errors anywhere under `src/feature/linktree/` (errors elsewhere, if pre-existing, are out of scope — confirm by checking the error list contains no `linktree` path).

Run: `npx eslint src/feature/linktree`
Expected: zero errors, zero warnings.

- [ ] **Step 2: Full manual walkthrough in the browser**

With the dev server running and logged in:
1. `/dashboard/linktree` — header, KPIs, search, status filter, sort, pagination, empty state (search for a nonsense string), loading skeleton (throttle network or observe on first load), Create dialog (all fields including nullable description/icon), Delete/Deactivate/Activate confirm dialogs from the table.
2. Click into a link's detail page — repeat the Task 7 Step 6 checklist.
3. From the detail page, deactivate the link, confirm the table's status filter and KPI row reflect it after navigating back.
4. Resize the browser to ~400px width — confirm the header, KPI grid, table toolbar, and detail page quick actions wrap sensibly (no horizontal scroll on the page body).

- [ ] **Step 3: Commit (only if Step 1/2 surfaced fixes)**

If no fixes were needed, skip this step — Task 7's commit is the last one. If fixes were needed:

```bash
git add -A src/feature/linktree
git commit -m "fix(linktree): address consistency issues found in full-branch review"
```

---
