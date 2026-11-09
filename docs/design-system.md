# Design System – Admin-Dashboard

Verbindliche Regeln für alle Seiten. Grundlage ist **shadcn/ui** (`src/components/ui/`) auf Radix.
Bevor eine neue Komponente entsteht: erst prüfen, ob shadcn/ui oder ein Baustein unten sie abdeckt.

## Tokens

Alle Werte liegen als CSS-Variablen in `src/index.css` und sind in `tailwind.config.js` gemappt.
In Komponenten **keine** Palettenfarben (`emerald-500`, `#3D5CFF` …), keine Hex-Werte.

| Rolle | Tailwind | Verwendung |
|---|---|---|
| Hintergrund | `bg-background` | App-Fläche hinter Cards |
| Surface | `bg-card` | Cards, Tabellen, Dialoge, Inputs |
| Muted | `bg-muted`, `text-muted-foreground` | Sekundärtext, Tabellenkopf, Skeletons |
| Accent | `bg-accent` | **neutrale** Hover-/Fokusfläche (nicht Markenfarbe) |
| Primary | `bg-primary`, `text-primary` | Primäraktion, aktiver Zustand, Links |
| Brand | `bg-brand`, `text-brand-teal` | Logo, Akzente in Charts – sonst nicht |
| Status | `success`, `warning`, `info`, `destructive` | jeweils `text-x`, `bg-x/10` (weiche Fläche), `border-x/30` |
| Linien | `border`, `border-input`, `ring` | |
| Charts | `chart-1` … `chart-5` | Reihenfolge = Serienreihenfolge |

Weitere Tokens:

- **Typografie**: `font-sans` (per Einstellung umschaltbar, Standard Inter), `font-mono` (DM Mono), `font-brand` (Sora, nur Logo). Rollen: Seitentitel `text-xl sm:text-2xl font-semibold`, Abschnitt `text-base font-semibold`, Fließtext `text-sm`, Meta `text-xs text-muted-foreground`, Kennzahl `text-2xl font-semibold tabular-nums`. Gewichte nur 400/500/600.
- **Radius**: `--radius` = 8px. `rounded-md` Controls, `rounded-lg` kleine Flächen, `rounded-xl` Cards/Tabellen/Dialoge.
- **Schatten**: `shadow-xs` Controls/Cards, `shadow-md` Popover/Dropdown, `shadow-lg` Dialoge. Tiefe entsteht primär über Borders.
- **Bewegung**: `duration-fast` (120ms) Hover, `duration-base` (180ms) Auf-/Zuklappen, `duration-slow` (280ms) Seitenwechsel. `prefers-reduced-motion` wird global respektiert.
- **Z-Index**: `z-header` 30, `z-sidebar` 40, `z-overlay` 50, `z-popover` 60, `z-toast` 100.
- **Breiten**: `max-w-page` 1440px (Standard), `max-w-page-narrow` 960px (Formulare/Einstellungen), `max-w-form` 42rem.
- **Abstände**: Seite `px-4 sm:px-6 lg:px-8`, vertikal `py-6 lg:py-8`; zwischen Seitenbereichen `gap/space-y-6`, in Grids `gap-4`, in Formularen `space-y-5`.

## Seitenaufbau

```tsx
<PageContainer title="Links">
  <PageHeader title="Links" description="…" actions={<Button>Link anlegen</Button>} />
  <StatGrid>…</StatGrid>                      // optional
  <PageToolbar actions={…}>…Suche/Filter…</PageToolbar>
  <DataTable … />                             // Hauptinhalt
</PageContainer>
```

- **PageHeader** immer zuerst. Primäraktion (`variant="default"`) ganz rechts, sekundäre Aktionen `outline`. Höchstens eine Primäraktion pro Seite.
- Detailseiten: `back={{ to, label }}`, Status als `meta`, Löschen nur im ⋯-Menü oder als letzte `outline`-Aktion – nie als roter Primärbutton.
- `PageSection` für weitere Bereiche mit eigener Überschrift; keine zusätzlichen verschachtelten Cards.

## Bausteine

| Baustein | Pfad | Zweck |
|---|---|---|
| `PageContainer`, `PageHeader`, `PageSection`, `SectionHeader`, `PageToolbar` | `components/layout/page.tsx` | Seitenstruktur |
| `EmptyState`, `ErrorState`, `StatusBadge`, Skeleton-Presets | `components/feedback/` | Zustände |
| `StatCard`/`StatGrid`, `DataTable`, `SearchInput`, `TablePagination`, `RowActions`, `UserAvatar` | `components/data/` | Daten |
| `ConfirmDialog`, `FormDialog` | `components/dialogs/` | Entscheidungen & Formulare |

### Tabellen

- Immer `DataTable` mit einer TanStack-Table-Instanz. Spaltenklassen über `meta.className` (z. B. `hidden md:table-cell`, damit Tabellen auf Mobile schlanker werden).
- Sortierbare Spalten bekommen automatisch Buttons + `aria-sort`.
- Klickbare Zeilen (`onRowClick`) sind per Tastatur erreichbar (Enter/Leertaste).
- Zeilenaktionen über `RowActions` (⋯), destruktive Einträge rot und abgesetzt.
- Leerer Zustand: `EmptyState variant="plain"`; bei aktiver Suche/Filter Text "Keine Treffer" + "Filter zurücksetzen".
- "Filter zurücksetzen" nur zeigen, wenn ein Filter aktiv ist.

### Formulare & Dialoge

- Anlegen/Bearbeiten: `FormDialog` (Größen `sm` 1–2 Felder, `md` Standard, `lg` komplex mit Abschnitten). Footer immer "Abbrechen" + Primäraktion.
- Mehr als ~8 Felder oder Vorschau nötig → eigene Seite (Blog-Editor) statt Dialog.
- Lesen von Details → `Sheet` rechts (`sm:max-w-md`, breit: `sm:max-w-xl`).
- Pflichtfelder ohne Sternchen-Flut: optionale Felder mit "(optional)" kennzeichnen.
- Fehlermeldungen unter dem Feld (`FormMessage`), Hilfetext über `FormDescription`.
- Löschen/Deaktivieren → `ConfirmDialog` (`destructive`). Alles andere ohne Bestätigung, Rückmeldung per Toast.

### Feedback

- Laden: Skeletons in der Form des Inhalts; Spinner nur in Buttons.
- Fehler: `ErrorState` mit "Erneut versuchen" – im normalen Seitenlayout, Header bleibt stehen.
- Erfolg: `toast.success('… gespeichert')` – kurz, deutsch, ohne Ausrufezeichen.
- Status: `StatusBadge` (Farbe + Punkt + Text). Puls nur für Live-Zustände.
- Demo-/Beispieldaten werden mit `demo` an der `StatCard` bzw. Badge "Demo" gekennzeichnet.

## Sprache

Oberfläche durchgängig **Deutsch**, Du-Form, Verben für Aktionen ("Link anlegen", "Speichern"). Routen und Code bleiben englisch.
