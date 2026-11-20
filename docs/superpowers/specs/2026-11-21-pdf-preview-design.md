# PDF-Vorschau für Angebote und Rechnungen — Design (kurz)

Stand: 2026-11-21 · Repo: `luka-lta-backend` (nur Dashboard, API unverändert)

**Absicht:** In der Detailansicht jedes Angebots und jeder Rechnung das PDF direkt sehen, ohne Download.

**Ziele:** Eingebettete Vorschau für alle Dokumentarten und Status (Entwurf mit Wasserzeichen, festgeschrieben,
importiert, Storno). Aktualisiert sich nach Speichern/Festschreiben.

**Nicht-Ziele:** Live-Vorschau während der Eingabe im Editor; neue Dependencies; API-Änderungen.

**Anti-Ziele:** Token in einer URL; veraltete Vorschau nach dem Speichern; Speicherleck durch nicht freigegebene
Blob-URLs.

**Constraints:** PDFs nur per authentifiziertem Request (`api`, Token im Header). iOS stellt PDFs in iframes schlecht
dar. Ohne Firmendaten liefert die API für Entwürfe einen Fehler.

## Approaches

1. **Blob-URL im `<iframe>` mit dem eingebauten Browser-Viewer** — *gewählt.* Keine Dependency, Zoom/Druck gratis.
2. **pdf.js / react-pdf** — einheitliche Darstellung auch auf iOS, aber neue, schwere Dependency. Verworfen.
3. **PDF als Bild serverseitig rendern** — API-Änderung, mehr Last. Verworfen.

## Design

- Neue Komponente `src/feature/business-documents/PdfPreview.tsx`: Props `path` (API-Pfad), `queryKey`, `title`.
  Lädt per React Query (`api.get(path, { responseType: 'blob' })`), erzeugt Blob-URL, zeigt sie in einem `<iframe>`
  (A4-Seitenverhältnis), gibt die URL beim Wechsel/Unmount frei. Lade-, Fehler- und Leerzustand mit den
  bestehenden Feedback-Komponenten; Fehler über die vorhandene Blob-Fehler-Auswertung aus `downloadPdf.ts`
  (gemeinsam nutzen statt duplizieren). Link „In neuem Tab öffnen“ (öffnet die Blob-URL).
- Query-Keys hängen an den bestehenden Keys (`["offers", …]`, `["invoices", …]`), sodass die vorhandene
  Invalidierung nach Speichern/Festschreiben/Storno/Zahlung die Vorschau neu lädt. Festgeschriebene PDFs ändern sich
  nicht; `staleTime` für sie unbegrenzt.
- Fehlen Firmendaten (Settings `null`) und das Dokument ist ein Entwurf: statt Request der bestehende
  Firmendaten-Hinweis mit Link zu den Einstellungen.
- Layout in `InvoiceDetail` und `OfferDetail`: ab `xl` zweispaltig (Daten links, Vorschau rechts, sticky), darunter
  einspaltig mit Vorschau unter den Daten.

**Dem Umsetzer überlassen:** genaue Breiten/Höhen, Komponentennamen für Teilstücke, Texte im Rahmen der
bestehenden deutschen UI.
