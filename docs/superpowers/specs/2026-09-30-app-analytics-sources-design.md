# App Analytics Sources — Design

## Ziel

Manche Apps in der App-Registry (siehe `2026-09-29-app-registry-design.md`)
haben Analytics-Daten aus externen Quellen — App Store Connect, Firebase,
oder eigene/andere Systeme (z. B. MySQL-Backend). Dieses Feature fügt der
Registry eine **Analytics-Quelle pro App** hinzu und zeigt die Analytics auf
einer neuen App-Detail-Seite an.

**Wichtige Randbedingung (vom Nutzer vorgegeben):** Die spätere echte
Backend-Implementierung liest die einzelnen Quellen (App Store Connect API,
Firebase API, eigene DB) aus und **normalisiert sie serverseitig in ein
einheitliches Format**, bevor sie ans Frontend gehen. Das Frontend kennt die
Eigenheiten der einzelnen Quellen nicht — es rendert ausschließlich das
normalisierte Format. Diese Spec baut das Frontend deshalb von Anfang an
gegen das normalisierte Format, nicht gegen quellspezifische Formate. Der
Mock-Layer tut nur so, als käme das Ergebnis schon normalisiert von der API.

Nicht Ziel: echte Anbindung an App Store Connect / Firebase / MySQL. Weiterhin
reine Demo-/Mock-Daten, wie beim Rest der App-Registry.

## Datenmodell-Erweiterung

`src/api/apps/schema.ts` bekommt ein neues Enum und ein neues Feld auf
`AppEntitySchema`:

```ts
export const AppAnalyticsSourceSchema = z.enum([
    "none",
    "app-store-connect",
    "firebase",
    "custom",
]);
export type AppAnalyticsSource = z.infer<typeof AppAnalyticsSourceSchema>;
```

`AppEntitySchema` erhält:
```ts
analyticsSource: AppAnalyticsSourceSchema.default("none"),
```
eingefügt direkt nach `status`. Da `AppInputSchema = AppEntitySchema.omit({id, createdAt, updatedAt})`
automatisch mitzieht, ist das Feld ohne weitere Änderung Teil von
Create/Update. Seed-Daten in `mockStore.ts` bekommen passende Werte:
PixelDiary/FocusFlow/TinyBudget → `app-store-connect`, Trackspire →
`firebase`, Café Sonnenblick/Fitness Nord → `none` (Kundenwebseiten haben
i. d. R. kein App-Analytics-Tracking in diesem Kontext).

## Einheitliches Analytics-Format (das, was die künftige API normalisiert liefert)

Neue Datei `src/api/apps/analyticsSchema.ts`:

```ts
export const AppAnalyticsPointSchema = z.object({
    date: z.string(), // YYYY-MM-DD
    value: z.number(),
});

export const AppAnalyticsSchema = z.object({
    source: AppAnalyticsSourceSchema, // praktisch nie "none": fetchAppAnalytics gibt für "none" direkt `null` zurück statt eines AppAnalytics-Objekts
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

Dieses eine Format deckt alle drei Quellen ab — nur die Labels und Werte
unterscheiden sich inhaltlich, nie die Struktur:

| Quelle | `primaryMetric.label` | `kpis` | `breakdown` |
|---|---|---|---|
| `app-store-connect` | „Downloads" (Zeitreihe) | Impressions gesamt, Conversion-Rate (%), Crashes | Top-Länder (Downloads je Land) |
| `firebase` | „Aktive Nutzer (DAU)" (Zeitreihe) | MAU, 7-Tage-Retention (%), Sessions/User | Top-Events (Event-Name → Anzahl) |
| `custom` | „Requests" (Zeitreihe) | Ø Latenz (ms), Error-Rate (%), Uptime (%) | Top-Endpunkte (Pfad → Anzahl) |

Das Frontend rendert ausschließlich anhand dieser generischen Feldnamen
(`primaryMetric`, `kpis`, `breakdown`) — es enthält keine
Quell-spezifische Fallunterscheidung außer für den Fall `analyticsSource === "none"`.

## Mock-Layer

`src/api/apps/analyticsMock.ts` — generiert für eine gegebene
`AppAnalyticsSource` ein `AppAnalytics`-Objekt mit obigen, quelltypischen
Labels und plausiblen Demo-Werten (30-Tage-Zeitreihe). Deterministisch pro
App-ID (z. B. simple seeded-random anhand eines Hash der ID), damit sich
Zahlen nicht bei jedem Aufruf ändern, aber unterschiedliche Apps
unterschiedliche Kurven zeigen.

`src/api/apps/analyticsEndpoints.ts`:
```ts
export async function fetchAppAnalytics(app: AppEntity): Promise<AppAnalytics | null> {
    await delay(300);
    if (app.analyticsSource === "none") return null;
    return AppAnalyticsSchema.parse(generateMockAnalytics(app.analyticsSource, app.id));
}
```
Einziger Ort, der später gegen einen echten normalisierenden
Backend-Endpunkt getauscht wird — Hooks/UI bleiben unverändert (gleiches
Prinzip wie `endpoints.ts` für die Registry selbst).

`src/api/apps/hooks.ts` bekommt:
```ts
export function useAppAnalytics(app: AppEntity | undefined) {
    return useQuery({
        queryKey: ["apps", "analytics", app?.id],
        queryFn: () => fetchAppAnalytics(app!),
        enabled: !!app,
    });
}
```

## UI

### Routing

Neue Route `/dashboard/apps/:appId` (Sibling der bestehenden `apps`-Route
in `AppRouter.tsx`), Seiten-Wrapper `src/pages/Dashboard/AppDetailPage.tsx`.

### AppCard — Navigation zur Detail-Seite

`src/feature/apps/components/AppCard.tsx`: der Icon+Name+Description-Block
im `CardHeader` wird in einen `Link` zu `/dashboard/apps/${app.id}`
gewrappt (`react-router-dom`). Edit-/Delete-Buttons im Footer bleiben wie
sie sind (kein Navigations-Konflikt, da sie in einem separaten Footer-Bereich
liegen, nicht im Link).

### Detail-Seite

`src/feature/apps/detail/index.tsx` (Muster: `DetailLinktree.tsx` 1:1
übernommen — Error-State, Loading-Skeleton, Header mit Zurück-Button,
Tabs):

- lädt `useApp(appId)` und (sobald die App geladen ist) `useAppAnalytics(app)`
- Header: Icon, Name, Status-Badge, Zurück-Button (`navigate('/dashboard/apps')`),
  Edit-Button (öffnet `AppFormDialog` im Edit-Modus), Delete-Button (öffnet
  `DeleteAppDialog`, navigiert nach erfolgreichem Löschen zurück zur Liste)
- Tabs `overview` / `analytics` (Radix Tabs wie im Vorbild)
  - **Overview**: zeigt die Entity-Felder als Definitionsliste — Beschreibung,
    Kategorie, Status, URL (klickbar), Metrics (falls vorhanden, gleiche
    Darstellung wie in `AppCard`), Analytics-Quelle (Badge)
  - **Analytics**: `AnalyticsTab.tsx`

### AnalyticsTab (generisch, kennt keine Quellen-Eigenheiten)

`src/feature/apps/detail/AnalyticsTab.tsx`:
- Props: `{ app: AppEntity }`
- lädt `useAppAnalytics(app)`
- `app.analyticsSource === "none"` **oder** `analytics.data === null` →
  `NoAnalyticsState` (Icon, Text „Keine Analytics-Quelle verbunden", Button
  „Quelle konfigurieren" öffnet `AppFormDialog` im Edit-Modus mit Fokus auf
  das neue Feld)
- Loading → Skeleton-Card
- Error → Inline-Fehlermeldung mit Retry
- Erfolg → rendert:
  - Ein Line-Chart aus `primaryMetric.series`, Titel = `primaryMetric.label`
    (dataviz-Skill für Farbe/Form verwenden, ein Chart = ein Hue, kein
    Rainbow, passendes Format je `unit`)
  - KPI-Reihe aus `kpis` (reuse `KpiCard`-artiges Layout, aber schlicht
    inline — kein neuer globaler Component nötig, da `KpiCard` an
    `value?: number` + `valueFormatter` gebunden ist und die Anzahl der
    KPIs hier dynamisch ist)
  - Optionale Breakdown-Liste aus `breakdown` (einfache Balkenliste oder
    Tabelle, analog zu bestehenden Listen-Patterns wie `AppStoreMetricsCard`)

### AppFormDialog — neues Feld

`src/feature/apps/components/AppFormDialog.tsx`: neues Select-Feld
„Analytics-Quelle" (Controller + `Select`, gleiche Machart wie Kategorie/
Status), Optionen aus einer neuen `ANALYTICS_SOURCE_LABELS`-Map in
`labels.ts`. Default in `emptyFormValues`: `"none"`.

## Fehlerbehandlung & States

- Kein Analytics für die App (`source: "none"`): `NoAnalyticsState`, kein
  Fehler.
- Ladezustand: Skeletons (Chart-Platzhalter + KPI-Platzhalter), Muster wie
  `DetailLinktree`.
- Query-Fehler: inline Fehlermeldung + Retry-Button (Muster:
  `DashboardAlerts`/`AppStoreMetricsCard`).
- App nicht gefunden (`useApp` Fehler auf ungültige ID): gleiche
  Fehlerdarstellung wie `DetailLinktree`s `QueryErrorDisplay`, kein Crash.

## Nicht enthalten (bewusst)

- Keine echte App Store Connect/Firebase/MySQL-Anbindung — nur Mock,
  Normalisierungs-Logik kommt später ausschließlich in
  `analyticsEndpoints.ts`.
- Keine Konfiguration von Zugangsdaten/API-Keys pro Quelle — das ist
  Teil der künftigen echten Anbindung, hier nur die Quellen-Auswahl als
  Enum.
- Keine Zeitraum-Filter (7/30/90 Tage o. ä.) für den Analytics-Chart —
  fixe 30-Tage-Demo-Zeitreihe, YAGNI für jetzt.
