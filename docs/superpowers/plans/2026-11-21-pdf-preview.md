# PDF-Vorschau Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eingebettete PDF-Vorschau in den Detailansichten von Angeboten und Rechnungen.

**Architecture:** Neue Komponente `PdfPreview` lädt das PDF per React Query als Blob über die authentifizierte
`api`-Instanz, zeigt es als Blob-URL im `<iframe>`; Query-Keys unter den bestehenden Domain-Keys, damit die
vorhandene Invalidierung die Vorschau mit aktualisiert.

**Tech Stack:** React, TypeScript, React Query, Axios (alles vorhanden, keine neue Dependency).

**Spec:** `docs/superpowers/specs/2026-11-21-pdf-preview-design.md`

## Global Constraints

- Kein Token in URLs; PDFs nur über `api` (`src/api/axios.ts`) mit `responseType: "blob"`.
- Keine neue Dependency. TypeScript strict, kein `any`, 2 Spaces, Semikolons, `@/`-Imports, max. 120 Zeichen.
- UI-Texte deutsch. `src/components/ui/` nicht umschreiben.
- Kein Test-Runner (Nutzerentscheidung): Verifikation über `bun run build` + `bunx eslint src` (0 Fehler,
  Warnungen ≤ 12) + Browser (der Nutzer testet selbst, falls kein Login möglich).

## Review Focus

1. Blob-URL wird beim Wechsel des PDFs und beim Unmount freigegeben (kein Leak beim Durchklicken vieler Rechnungen).
2. Nach Speichern eines Entwurfs zeigt die Vorschau den neuen Stand (Query-Key unter `["invoices"]`/`["offers"]`).
3. Entwurf ohne Firmendaten: kein Request, stattdessen Hinweis — kein roter Fehler.
4. Fehlerkörper als Blob werden lesbar angezeigt (gemeinsamer Helper statt Duplikat).
5. Schmale Viewports: Vorschau unter den Daten, Link „In neuem Tab öffnen“ funktioniert.

---

### Task 1: PdfPreview-Komponente

**Files:**
- Create: `src/feature/business-documents/PdfPreview.tsx`, `src/feature/business-documents/pdfBlob.ts`
- Modify: `src/feature/business-documents/downloadPdf.ts` (nutzt `loadPdfBlob` aus `pdfBlob.ts`)

**Interfaces:**
- Produces:
  - `pdfBlob.ts`: `loadPdfBlob(path: string): Promise<{ blob: Blob; contentDisposition: unknown }>` —
    enthält die bisherige Blob-Fehler-Auswertung (`toReadableError`) aus `downloadPdf.ts`.
  - `PdfPreview` Props: `{ path: string; queryKey: readonly unknown[]; title: string; isFinal: boolean;
    isBlocked?: boolean; blockedHint?: ReactNode }`. `isFinal` → `staleTime: Infinity`; `isBlocked` → kein Request,
    stattdessen `blockedHint`.
  - Query-Keys der Aufrufer: `["invoices", "pdf", invoiceId]`, `["offers", "pdf", offerId]`.

- [ ] **Step 1:** `pdfBlob.ts` anlegen, `downloadPdf.ts` darauf umstellen (Verhalten identisch).
- [ ] **Step 2:** `PdfPreview` mit `useQuery` (queryFn `loadPdfBlob(path)`), Blob-URL via `useMemo`/`useEffect` mit
  `URL.revokeObjectURL` im Cleanup; `<iframe title={title}>` im Seitenverhältnis A4 (`aspect-[1/1.414]`, volle
  Breite); Lade-Skeleton, `ErrorState` mit Retry, Link „In neuem Tab öffnen“ (`target="_blank"`, `rel="noopener"`).
- [ ] **Step 3:** `bun run build && bunx eslint src` → 0 Fehler, ≤ 12 Warnungen.
- [ ] **Step 4: Commit** `feat(business): pdf preview component`

### Task 2: Einbindung in Angebot und Rechnung

**Files:**
- Modify: `src/feature/invoices/components/InvoiceDetail.tsx`, `src/feature/offers/components/OfferDetail.tsx`

**Interfaces:**
- Consumes: `PdfPreview` (Task 1), `getInvoicePdfPath`, `getOfferPdfPath`, `useBusinessSettings`,
  `FinalizeHints` bzw. vorhandener Firmendaten-Hinweis.

- [ ] **Step 1:** Layout: Wrapper `xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] xl:gap-6`; Vorschau-Spalte
  `xl:sticky xl:top-4 self-start`; darunter einspaltig mit Vorschau nach den Daten.
- [ ] **Step 2:** `isFinal` = Dokument nicht im Status `draft`; `isBlocked` = Entwurf und Firmendaten `null`,
  `blockedHint` = vorhandener Hinweis mit Link zu Einstellungen. Titel z. B. „Vorschau RE-2026-0004“ /
  „Vorschau Entwurf“.
- [ ] **Step 3:** Prüfen, dass jede Mutation, die das PDF ändert (Speichern, Festschreiben, Versenden, Storno,
  Zahlung — letzteres ändert das PDF nicht, schadet aber nicht), `["invoices"]` bzw. `["offers"]` invalidiert —
  bestehende Hooks; nichts anpassen, wenn bereits gegeben.
- [ ] **Step 4:** `bun run build && bunx eslint src` → 0 Fehler, ≤ 12 Warnungen.
- [ ] **Step 5: Commit** `feat(business): show pdf preview in offer and invoice details`
