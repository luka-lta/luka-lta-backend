# Linktree UX/UI Overhaul — Design

## Goal

Bring the Linktree feature (overview list, detail page, dialogs, table) up to
the same design system and UX quality as the Homelab dashboard
(`src/feature/homelab/`), which serves as the reference implementation for
layout, spacing, component choice, and interaction patterns in this app.
Not a copy — Homelab's patterns are adapted to Linktree's actual use cases
(server-paginated data, a dedicated detail route, simpler entity shape).

## Current state (problems identified)

- **List header** is a bare `<h2>` + subtitle, no status summary, no KPI
  row. Homelab has a status pill, "last updated", and a `KpiCard` row.
- **Table toolbar** has search only; no status filter. Homelab's
  `ContainerTable` has search + status Select + host Select.
- **Table "Display Name" column** hacks an avatar + `|` separator + name,
  with a separate "Description" column. Homelab's Name column combines
  name (bold) + subtitle (muted) in one cell.
- **Duplicate, out-of-sync edit surfaces**: `EditLinkSheet` (fields:
  displayname, description, url, isActive, iconName) opened from the list
  row menu, and `EditForm` on the detail page (fields: displayname, url,
  isActive only — missing description and iconName). Two schemas, two
  forms, two code paths for the same operation.
- **Detail page destructive/toggle actions unreachable**: Activate,
  Deactivate, and Delete are only wired up in the list's `LinksDialogs`/
  `links-context`. A user on the detail page has no way to deactivate or
  delete the link they're looking at without going back to the list.
- **Detail page click chart is fully fake**: hardcoded dates from
  2024-04 to 2024-06, unrelated to the link being viewed. A `timeRange`
  state exists (`useState("7d")`) but there is no UI to change it — dead
  code.
- **Refresh button** lives inside the table toolbar; Homelab puts it in
  the page header next to the title.

## Out of scope

- No backend changes. No new API endpoints. The click chart stays
  client-side mock data (no per-link click-history endpoint exists).
- No changes to `feature/clicks` or `feature/dashboard`.

## Design

### 1. List page — `feature/linktree/index.tsx`

New `LinktreeHeader` component (new file,
`feature/linktree/components/LinktreeHeader.tsx`), modeled on
`HomelabHeader`:
- Title "Links" + a `Status`/`StatusIndicator`/`StatusLabel` pill computed
  from the loaded list: "All links active" (online) when every link is
  active and not deactivated, otherwise "N need attention" (degraded).
- `RefreshButton` moved here (invalidates `['linktree', 'list']`),
  replacing the header-less bare title block. Removed from the table
  toolbar.

New `LinktreeSummaryKpis` component (new file,
`feature/linktree/components/LinktreeSummaryKpis.tsx`), modeled on
`SummaryKpis`: reuses `KpiCard` for Total, Active, Inactive, Deactivated
counts, computed from the current page's `links` array (best-effort;
these are page-local counts like the rest of the table, not global
totals — no new endpoint).

Page composition: `LinktreeHeader` → `LinktreeSummaryKpis` →
`LinktreeTable` → `LinksDialogs`, inside `Main`/`LinksProvider` as today.

### 2. Table — `LinktreeTable.tsx`

Toolbar restructured to match `ContainerTable`'s: search input + a status
`Select` (All / Active / Inactive / Deactivated) + Clear button. The
status filter is client-side over the current page (consistent with how
search is currently debounced server-side via `setFilterData`, status
adds a local `Record<string, string>` param `isActive`/`deactivated`
passed the same way if the backend supports it — otherwise filtered
client-side over `links`; implementation checks `fetchLinktreeList`
params handling and falls back to client-side filtering if unsupported).

Columns: merge "Display Name" + "Description" into one "Link" column —
`CustomFaIcon` avatar, `displayname` bold on top, description muted
truncated subtitle below (or "No description" placeholder), dropping the
`|` separator hack. URL, Status, Created At, actions columns unchanged.

Row actions dropdown: "Edit" now calls
`navigate(`/dashboard/linktree/${link.id}`)` instead of
`setOpen('edit')`. Activate/Deactivate/Delete items unchanged.

### 3. Dialogs

- `EditLinkSheet.tsx` deleted.
- `links-context.tsx`: `LinkDialogTypes` narrows to
  `'add' | 'delete' | 'deactivate' | 'activate'`.
- `LinksDialogs.tsx`: drops the `EditLinkSheet` import/branch.
- `CreateLinkDialog`, `DeleteLinkDialog`, `DeactivateLinkDialog`,
  `ActivateLinkDialog` unchanged (already consistent with the
  `ConfirmDialog`/kibo patterns Homelab uses).

### 4. Detail page — `DetailLinktree.tsx`

Header restructured to match `ContainerDetailSheet`'s header shape: back
button, `displayname` as title, status pill inline. Below the title, a
row of quick actions now reachable from the detail page itself for the
first time:
- "Visit link" (existing behavior, opens URL)
- `CopyButton` for the URL (already exists in `LinkDetails`, kept there)
- Activate/Deactivate (whichever applies) and Delete, as `Button`s that
  open the *same* `DeactivateLinkDialog`/`ActivateLinkDialog`/
  `DeleteLinkDialog` components used by the list — these already take
  `open`/`onOpenChange`/`currentRow` props decoupled from
  `links-context`, so the detail page manages its own local
  `useState<'delete' | 'deactivate' | 'activate' | null>` instead of
  wrapping itself in `LinksProvider`. On delete success, navigate back to
  `/dashboard/linktree`.

Content restructured into `Tabs` (`Tabs`/`TabsList`/`TabsTrigger`/
`TabsContent`, matching `feature/dashboard/index.tsx`'s own
Overview/Analytics tabs — the most direct precedent in this codebase):

- **Overview** tab: `EditForm` (expanded — see below) in a 2-col layout
  with `LinkDetails` (read-only meta card) + `QrCodeDisplay` alongside,
  same proportions as today (edit col-span-2, meta col-span-1).
- **Analytics** tab: `DetailClickChart`, restyled to match the
  `chart.tsx`/Homelab charting conventions already used elsewhere
  (`ChartContainer` + `ChartTooltipContent`), with a working 7d/30d/90d
  toggle (`Tabs` or `Select`, small, top-right of the card) wired to the
  existing `timeRange` state. Card subtitle/badge makes clear this is
  sample data (no backend change): e.g. `CardDescription` text "Sample
  data — click tracking not yet connected".

### 5. Schema

`LinkDetailEditSchema` (`childPages/detail/schema/LinkDetailSchema.ts`)
extended to match `linkCreateSchema`/`EditLinkSheet`'s schema:
`displayname`, `description` (nullable), `url`, `isActive`, `iconName`
(nullable). `EditForm` gains the description `Textarea` and icon
`TextInput` fields, same as the old `EditLinkSheet` had.

## Testing

Manual verification only (no existing test suite for this feature):
`npx tsc --noEmit`, then browser walkthrough of: list header/KPIs, status
filter, create dialog, detail page navigation, all four quick actions
from the detail page, edit form save with all fields, analytics tab
toggle, empty/loading/error states (loading via React Query devtools or
slow network throttle, error via a bad request if feasible).

## Files touched

New:
- `feature/linktree/components/LinktreeHeader.tsx`
- `feature/linktree/components/LinktreeSummaryKpis.tsx`

Modified:
- `feature/linktree/index.tsx`
- `feature/linktree/components/LinktreeTable.tsx`
- `feature/linktree/components/LinksDialogs.tsx`
- `feature/linktree/context/links-context.tsx`
- `feature/linktree/childPages/detail/DetailLinktree.tsx`
- `feature/linktree/childPages/detail/components/form/EditForm.tsx`
- `feature/linktree/childPages/detail/components/DetailClickChart.tsx`
- `feature/linktree/childPages/detail/schema/LinkDetailSchema.ts`

Deleted:
- `feature/linktree/components/sheet/EditLinkSheet.tsx`
