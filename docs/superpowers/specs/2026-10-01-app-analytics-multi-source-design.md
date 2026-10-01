# App Analytics Multi-Source — Design

## Kontext & Ziel

`2026-09-30-app-analytics-sources-design.md` hat jeder App genau **eine**
Analytics-Quelle gegeben (`analyticsSource: 'none' | 'app-store-connect' |
'firebase' | 'custom'`) und eine generische Detail-Seite mit Overview/
Analytics-Tabs gebaut. Das wurde bereits implementiert (Branch `feature-61`,
Commits bis `a4892bd`).

In der Praxis kann eine App **mehrere** Quellen gleichzeitig haben (z. B.
eine App-Store-App, die zusätzlich Firebase Analytics eingebunden hat).
Außerdem soll das Formular schon jetzt Felder für **Zugangsdaten** pro
Quelle vorsehen — damit eine spätere echte Backend-Implementierung diese
Zugangsdaten für einen Cronjob nutzen kann, der die Werte automatisch
abruft, statt dass sie manuell eingetragen werden. Diese Spec ersetzt das
Single-Source-Datenmodell durch ein Multi-Source-Modell und erweitert die
UI entsprechend.

**Nicht Ziel:** echtes Abrufen von Daten über die Zugangsdaten, echte
Verschlüsselung/Sicherung der Zugangsdaten, ein echter Cronjob. Die
Zugangsdaten werden im Mock-Layer als Klartext-Strings gehalten — reine
Demo, die Backend-Seite (Cron, sichere Speicherung, echter API-Call) ist
explizit spätere Arbeit des Nutzers.

## Datenmodell

`src/api/apps/schema.ts` — ersetzt das bisherige `analyticsSource`-Feld:

```ts
export const AppAnalyticsSourceTypeSchema = z.enum([
    "app-store-connect",
    "firebase",
    "custom",
]);
export type AppAnalyticsSourceType = z.infer<typeof AppAnalyticsSourceTypeSchema>;

export const AppAnalyticsSourceConfigSchema = z.object({
    id: z.string(),
    type: AppAnalyticsSourceTypeSchema,
    enabled: z.boolean().default(true),
    // Generische Key-Value-Map; welche Keys erwartet werden hängt von
    // `type` ab (siehe Tabelle unten). Rein als Demo-Platzhalter - die
    // künftige echte API entscheidet, wie Zugangsdaten tatsächlich
    // gespeichert/verschlüsselt werden.
    credentials: z.record(z.string(), z.string()).default({}),
});
export type AppAnalyticsSourceConfig = z.infer<typeof AppAnalyticsSourceConfigSchema>;
```

`AppEntitySchema` ändert sich von `analyticsSource: AppAnalyticsSourceSchema.default("none")`
zu:

```ts
analyticsSources: z.array(AppAnalyticsSourceConfigSchema).default([]),
```

Die alten Typen `AppAnalyticsSourceSchema`/`AppAnalyticsSource` (mit
`"none"`) entfallen vollständig — "keine Quelle" wird jetzt durch ein
leeres Array ausgedrückt, nicht durch einen Enum-Wert. Jede Stelle im
bereits gebauten Code, die auf `analyticsSource` zugreift, muss auf
`analyticsSources` umgestellt werden.

**Credential-Felder pro Typ** (für die UI, nicht Teil der Zod-Validierung
der Werte selbst — die Map ist bewusst generisch):

| Typ | Felder (Key → Label) |
|---|---|
| `app-store-connect` | `issuerId` → "Issuer ID", `keyId` → "Key ID", `privateKey` → "Private Key" (Textarea, maskiert dargestellt) |
| `firebase` | `projectId` → "Project ID", `serviceAccountJson` → "Service-Account-JSON" (Textarea, maskiert dargestellt) |
| `custom` | `baseUrl` → "Base-URL", `apiKey` → "API-Key" (maskiert dargestellt) |

## Normalisiertes Analytics-Format (unverändert)

`src/api/apps/analyticsSchema.ts` (`AppAnalyticsSchema`,
`AppAnalyticsPointSchema`) bleibt strukturell exakt wie in der
Vorgänger-Spec — `primaryMetric` / `kpis` / `breakdown`. Keine Änderung
nötig. Das Feld `source` in `AppAnalyticsSchema` wechselt von
`AppAnalyticsSourceSchema` (mit `"none"`) auf `AppAnalyticsSourceTypeSchema`
(ohne `"none"`, da ein konkretes `AppAnalytics`-Objekt immer zu einer
konkreten konfigurierten Quelle gehört).

## Mock-Layer

`src/api/apps/analyticsMock.ts`: `generateMockAnalytics` wird von
`(source, appId)` auf `(type: AppAnalyticsSourceType, seed: string)`
umbenannt in der Bedeutung des zweiten Parameters — Aufrufer übergeben
jetzt `sourceConfig.id` statt `app.id` als Seed, damit zwei Quellen
derselben App unterschiedliche, aber stabile Demo-Zeitreihen erzeugen
(bisher war `appId` der alleinige Seed; jetzt muss der Seed pro
Quellen-Konfiguration eindeutig sein). Die drei `generate*`-Funktionen
selbst (App-Store-Connect-, Firebase-, Custom-Flavor) bleiben inhaltlich
unverändert.

`src/api/apps/analyticsEndpoints.ts`:
```ts
export async function fetchAppAnalytics(
    app: AppEntity,
    sourceConfigId: string,
): Promise<AppAnalytics | null> {
    await delay(300);
    const sourceConfig = app.analyticsSources.find((s) => s.id === sourceConfigId && s.enabled);
    if (!sourceConfig) return null;
    return AppAnalyticsSchema.parse(generateMockAnalytics(sourceConfig.type, sourceConfig.id));
}
```

`src/api/apps/hooks.ts`:
```ts
export function useAppAnalytics(app: AppEntity | undefined, sourceConfigId: string | undefined) {
    return useQuery({
        queryKey: ["apps", "analytics", app?.id, sourceConfigId],
        queryFn: () => fetchAppAnalytics(app!, sourceConfigId!),
        enabled: !!app && !!sourceConfigId,
    });
}
```

## Seed-Daten

`src/api/apps/mockStore.ts`:
- PixelDiary, FocusFlow, TinyBudget: je ein Eintrag in `analyticsSources`
  mit `type: "app-store-connect"`, `enabled: true`, plausible Demo-
  Credentials (z. B. `issuerId: "demo-issuer-123"`, `keyId: "DEMO1234"`,
  `privateKey: "-----BEGIN PRIVATE KEY-----\ndemo\n-----END PRIVATE KEY-----"`).
- Trackspire: **zwei** Einträge — `app-store-connect` UND `firebase`,
  beide `enabled: true` — als Demonstration der Multi-Source-Fähigkeit.
- Café Sonnenblick, Fitness Nord: `analyticsSources: []` (unverändert
  "keine Quelle").

## UI

### AppFormDialog — Quellen-Verwaltung statt Single-Select

Ersetzt das bisherige einzelne "Analytics-Quelle"-`Select`-Feld durch
einen Abschnitt "Analytics-Quellen":

- `useFieldArray({ control, name: "analyticsSources" })` (react-hook-form)
  verwaltet die Liste im Formular-State.
- Pro konfigurierter Quelle eine kompakte Zeile/Card: Typ-Icon + Typ-Label
  (aus einer neuen `ANALYTICS_SOURCE_TYPE_LABELS`-Map in `labels.ts`),
  ein `Switch` für `enabled`, ein Löschen-Button (`remove(index)` aus
  `useFieldArray`).
- "+ Quelle hinzufügen"-Button öffnet einen kleinen Inline-Bereich (kein
  separates Modal): `Select` für den Typ (app-store-connect/firebase/
  custom), darunter dynamisch die passenden Credential-Inputs für den
  gewählten Typ (aus der Tabelle oben — Textarea für mehrzeilige Felder
  wie `privateKey`/`serviceAccountJson`, sonst `Input type="password"`
  für Maskierung). Ein "Hinzufügen"-Button im Inline-Bereich ruft
  `append({ id: crypto.randomUUID(), type, enabled: true, credentials: {...} })`
  auf und schließt den Inline-Bereich wieder.
- Validierung: Typ ist Pflicht beim Hinzufügen; Credential-Felder dürfen
  leer bleiben (reine Demo-Platzhalter, kein Pflichtfeld-Zwang — der
  Nutzer kann eine Quelle anlegen und Zugangsdaten später nachtragen).

### AnalyticsTab — Pills pro Quelle

`src/feature/apps/detail/AnalyticsTab.tsx`:
- `enabledSources = app.analyticsSources.filter(s => s.enabled)`
- `enabledSources.length === 0` → `NoAnalyticsState` (unverändert in der
  Bedeutung, jetzt auf Array-Länge statt Enum-Wert geprüft)
- Sonst: lokaler State `selectedSourceId` (default: `enabledSources[0].id`),
  eine Pill-Leiste (`Badge`- oder `Button`-Pills, ein Eintrag pro
  `enabledSources`, Label = `ANALYTICS_SOURCE_TYPE_LABELS[type]`),
  aktive Pill hervorgehoben. Darunter exakt der bestehende generische
  Chart+KPI+Breakdown-Block aus der Vorgänger-Spec, jetzt gespeist von
  `useAppAnalytics(app, selectedSourceId)` statt `useAppAnalytics(app)`.
  Die Kernarchitektur-Regel bleibt unverändert: der Rendering-Teil
  branched niemals auf den konkreten Quellentyp, nur die Pill-Auswahl
  entscheidet, welche Quelle geladen wird.

### AppOverviewTab — mehrere Badges statt einem

Der bisherige einzelne `<Badge>Analytics: ...</Badge>` wird zu:
```tsx
{app.analyticsSources.length > 0 && (
    <div className="flex flex-wrap gap-2">
        {app.analyticsSources.map((s) => (
            <Badge key={s.id} variant="outline">
                {ANALYTICS_SOURCE_TYPE_LABELS[s.type]}{!s.enabled && " (deaktiviert)"}
            </Badge>
        ))}
    </div>
)}
```

### labels.ts

`ANALYTICS_SOURCE_LABELS` (mit `"none"`) entfällt, ersetzt durch:
```ts
export const ANALYTICS_SOURCE_TYPE_LABELS: Record<AppAnalyticsSourceType, string> = {
    "app-store-connect": "App Store Connect",
    firebase: "Firebase",
    custom: "Eigene Quelle",
};
```

## Fehlerbehandlung & States

Unverändert gegenüber der Vorgänger-Spec (Loading-Skeleton, Error+Retry,
App-nicht-gefunden) — nur die Bedingung für "keine Analytics" wechselt
von `analyticsSource === "none"` auf `analyticsSources.filter(enabled).length === 0`.

## Nicht enthalten (bewusst)

- Keine echte Anbindung an App Store Connect/Firebase/eigene APIs.
- Kein echter Cronjob, keine Server-seitige Speicherung/Verschlüsselung
  von Zugangsdaten — das ist explizit spätere Arbeit außerhalb dieses
  Frontends.
- Keine Validierung der Credential-Werte selbst (z. B. Format-Prüfung
  eines privaten Schlüssels) — reine Freitext-Platzhalter.
- Kein Umordnen/Drag&Drop der Quellen-Liste.
