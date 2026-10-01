# App Registry — Design

## Ziel

Aktuell sind "Apps" (die im App Store veröffentlichten Apps, die die
Business-KPI-Cards des Dashboards anzeigen) als hardcodiertes Array in
`src/feature/dashboard/business/demoData.ts` hinterlegt. Es gibt keine
Möglichkeit, im UI Apps anzulegen, zu bearbeiten oder zu löschen.

Dieses Feature ersetzt das hardcodierte Array durch ein generisches,
konfigurierbares **App-Registry-System**: eine zentrale Datenstruktur für
"Dinge, die der Nutzer betreibt" (App-Store-Apps, Kundenwebseiten, eigene
SaaS-Produkte, interne Tools), verwaltbar über eine eigene UI-Seite mit
vollem CRUD. Es wird weiterhin mit Demo-/Mock-Daten gearbeitet — die
Architektur ist aber so geschnitten, dass ein späterer Umstieg auf ein
echtes Backend nur den Austausch der `endpoints.ts`-Implementierung
erfordert.

Nicht Ziel dieses Features: echte Backend-Anbindung, Persistenz über
Reload hinaus (State lebt nur in-memory für die Session), historische
Zeitreihen pro App.

## Datenmodell

`src/api/apps/schema.ts` (Zod, "parse don't validate" — Formular- und
Fetch-Ergebnisse laufen durch dasselbe Schema):

```ts
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

export const AppMetricsSchema = z.object({
    revenue: z.number().nonnegative().optional(),
    downloads: z.number().int().nonnegative().optional(),
    rating: z.number().min(0).max(5).optional(),
    mrr: z.number().nonnegative().optional(),
    activeUsers: z.number().int().nonnegative().optional(),
    churnPercent: z.number().min(0).max(100).optional(),
});

// Liste lebt im API-Layer, nicht in der UI - schema.ts darf nicht von
// feature/apps abhängen. Die UI mappt diese Keys auf Icon-Components.
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

export type AppEntity = z.infer<typeof AppEntitySchema>;
export type AppCategory = z.infer<typeof AppCategorySchema>;
export type AppStatus = z.infer<typeof AppStatusSchema>;
export type AppMetrics = z.infer<typeof AppMetricsSchema>;
```

Für Create/Update ein separates Input-Schema ohne `id`/`createdAt`/`updatedAt`
(diese werden vom Service-Layer gesetzt):

```ts
export const AppInputSchema = AppEntitySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export type AppInput = z.infer<typeof AppInputSchema>;
```

**Icon**: kein React-Component im Datenmodell (nicht serialisierbar,
nicht zukunftssicher für eine echte API). Stattdessen ein string-Key aus
einem kuratierten, app-unabhängigen Icon-Set:

```ts
// src/feature/apps/iconOptions.ts — mappt die im API-Layer definierten
// Keys (AppIconKeySchema) auf Icon-Components. Reine UI-Zuordnung.
export const APP_ICON_OPTIONS: Record<AppIconKey, React.ElementType> = {
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
```

Die Key-Liste ist bewusst generisch (Icon-*Typen*, keine konkreten
App-Namen) und liegt im API-Layer (`AppIconKeySchema`), die UI liefert nur
die Zuordnung auf Components. Erweiterung um neue Icons: Key in
`APP_ICON_KEYS` ergänzen + Mapping in `iconOptions.ts` ergänzen.

## Architektur (Service-Layer-Schnitt)

Folgt 1:1 dem bestehenden `blog`-Feature-Muster im Projekt
(`src/api/blog/{endpoints,hooks}.ts` + `src/feature/blog/schema/`), damit
kein Parallelmuster entsteht:

```
UI (src/feature/apps/*)
  → Hooks (src/api/apps/hooks.ts)          — react-query, Cache/Invalidation
    → Endpoints (src/api/apps/endpoints.ts) — Signatur wie später echte API
      → mockStore (src/api/apps/mockStore.ts) — in-memory Array + Seed-Daten
```

- `mockStore.ts`: hält ein modul-internes Array `AppEntity[]`, initial mit
  Seed-Daten befüllt (siehe unten). Exponiert nur die Funktionen, die
  `endpoints.ts` braucht (`list`, `get`, `insert`, `update`, `remove`) —
  kein direkter Zugriff von außen. State lebt nur für die Dauer der
  Session (kein `localStorage`, wie entschieden).
- `endpoints.ts`: `fetchAppList()`, `fetchApp(id)`, `createApp(input)`,
  `updateApp(id, input)`, `deleteApp(id)` — jede Funktion `async`, mit
  künstlicher Latenz (`await delay(300)`) damit sich Loading-States wie
  bei einer echten API verhalten, und Rückgabewerte laufen durch die
  Zod-Schemas geparst. **Einziger Ort**, der beim Umstieg auf ein echtes
  Backend angefasst werden muss — Hooks und UI bleiben unverändert.
- `hooks.ts`: `useAppList()`, `useApp(id)`, `useCreateApp()`,
  `useUpdateApp()`, `useDeleteApp()` — react-query `useQuery`/`useMutation`,
  Query-Key `['apps', 'list']` bzw. `['apps', 'detail', id]`,
  Invalidation nach jeder Mutation (Muster wie
  `useCreateBlogPost`/`useDeleteBlogPost`).

## UI

Neue Sidebar-Seite **„Apps"** (`/dashboard/apps`, Icon `Boxes`, Gruppe
„General" neben Dashboard/Tools):

- `src/feature/apps/index.tsx` — Seiten-Header + „+ Neue App"-Button,
  lädt `useAppList()`. Kein Ergebnis → `EmptyAppsState`. Sonst Grid aus
  `AppCard`.
- `AppCard.tsx` — rein datengetrieben, kennt keine konkrete App:
  Icon (via `APP_ICON_OPTIONS[app.icon]`, Fallback `Boxes`), Name,
  Kategorie-Badge, Status-Badge (Farbe je Status), Description
  (truncated), Metrics-Zeile (rendert nur die Felder, die in
  `app.metrics` gesetzt sind — kein Feld ⇒ keine Anzeige), Footer mit
  Edit-/Delete-Icon-Buttons und optionalem externen Link (`url`).
- `AppFormDialog.tsx` — ein Dialog für Create **und** Edit
  (`mode: 'create' | 'edit'`, `defaultValues?: AppEntity`), Formular mit
  react-hook-form + `zodResolver(AppInputSchema)` (Muster wie
  `BlogEditorForm`): Name, Description (Textarea), Icon-Picker (Grid aus
  `APP_ICON_OPTIONS`), Category-Select, Status-Select, URL-Input,
  aufklappbarer „Metriken"-Bereich mit Zahlen-Inputs für Revenue,
  Downloads, Rating, MRR, Active Users, Churn — alle optional.
- `DeleteAppDialog.tsx` — dünner Wrapper um bestehende `ConfirmDialog`
  (Muster wie `DeleteBlogDialog`), nutzt `useDeleteApp()`.
- `EmptyAppsState.tsx` — Icon, kurzer Erklärtext („Noch keine Apps
  angelegt"), primärer CTA-Button „Erste App anlegen" (öffnet
  `AppFormDialog` im Create-Modus).

Validierung: Name Pflichtfeld (1–100 Zeichen), Description max. 500
Zeichen, URL wenn gesetzt muss valide URL sein, Metrics-Zahlenfelder
`nonnegative`/Rating 0–5/Churn 0–100 — jeweils per Zod im Formular
gespiegelt (`zodResolver`), Fehlermeldungen direkt unter dem Feld
(bestehendes Formular-Fehler-Pattern aus `BlogEditorForm` übernehmen).

## Kopplung an bestehende Business-Widgets

- `AppStoreMetricsCard` (`src/feature/dashboard/business/`): liest
  `useAppList()`, filtert `category === 'app-store'`, rendert
  Downloads/Revenue/Rating aus `app.metrics` statt aus dem alten
  `appMetrics`-Demo-Array.
- `BusinessSummaryKpis`: „App Store Revenue" = Summe `metrics.revenue`
  über alle Apps mit `category === 'app-store'`. „Trackspire MRR" =
  `metrics.mrr` der App mit `category === 'saas'` (Name „Trackspire").
  Beide Werte über `useAppList()` statt der bisherigen
  `totalAppStoreRevenue()`/`trackspireStats`-Funktionen aus
  `demoData.ts`.
- `TrackspireKpisCard`: Kopfzahlen (MRR, Active Users, Churn) kommen
  ebenso aus der Trackspire-App-Entity. Der monatliche MRR-Chart
  (`trackspireMonthlyMrr`, 6 Monate) bleibt eigene Demo-Zeitreihe —
  Apps tragen keine Historie, das wäre verfrühte Komplexität.
- `RevenueFinanceCard`: monatlicher Umsatz-Chart bleibt unverändert
  eigene Demo-Zeitreihe (`monthlyRevenue`), aus demselben Grund. Die
  Liste offener Rechnungen (`openInvoices`) ist konzeptionell unabhängig
  von Apps und bleibt wie sie ist.
- `demoData.ts` wird auf die verbleibenden, nicht app-bezogenen Daten
  reduziert (`monthlyRevenue`, `openInvoices`, `trackspireMonthlyMrr`,
  Hilfsfunktionen `totalRevenueThisMonth`, `totalOpenInvoiceAmount`).
  `appMetrics`, `totalAppStoreRevenue`, `trackspireStats` werden entfernt
  und durch aus der App-Registry abgeleitete Werte ersetzt.

## Seed-/Demo-Daten

`src/api/apps/mockStore.ts` startet mit realistischen Beispiel-Einträgen,
die die drei bisherigen Business-Kategorien abdecken (mindestens):

- 3 App-Store-Apps (die bisherigen: PixelDiary, FocusFlow, TinyBudget —
  Werte 1:1 aus dem bisherigen `demoData.ts` übernommen)
- 1 SaaS-Eintrag „Trackspire" (Werte aus bisherigem `trackspireStats`)
- 1–2 Kundenwebseiten-Einträge (neu, zur Veranschaulichung der Kategorie
  `client-website`)

## Fehlerbehandlung & States

- Ladezustand: Skeleton-Cards im Grid (Muster: bestehende `Skeleton`-
  Nutzung in `KpiCard`).
- Fehler beim Laden: Inline-Fehleranzeige mit Retry-Button (Muster:
  bestehende `DashboardAlerts`).
- Leerer Zustand: `EmptyAppsState`, s.o.
- Mutation-Fehler (Create/Update/Delete): `toast.error(...)` (Muster:
  `DeleteBlogDialog`).
- Doppelte Submits während Pending: Form-Submit-Button disabled +
  Spinner (Muster: bestehende `Spinner`-Nutzung in `ConfirmDialog`).

## Nicht enthalten (bewusst)

- Kein echtes Backend, keine Persistenz über Reload hinaus.
- Keine Zeitreihen/Historie pro App.
- Keine Berechtigungen/Multi-User-Aspekte (Dashboard ist Single-User).
- Kein Icon-Upload — nur kuratiertes Icon-Set.
