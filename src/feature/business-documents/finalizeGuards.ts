import { startOfYearBerlinIsoDate, todayBerlinIsoDate } from "@/lib/dateTimeUtils.ts";

/**
 * Spiegelt die API-Prüfung beim Festschreiben/Versenden: Das Dokumentdatum darf weder in der Zukunft noch vor
 * dem 1. Januar des laufenden Jahres liegen (Berlin). Liefert einen deutschen Hinweis oder null, wenn alles passt.
 */
export function getDocumentDateHint(documentDate: string): string | null {
  if (documentDate > todayBerlinIsoDate()) {
    return "Das Datum liegt in der Zukunft. Vor dem Festschreiben das Datum im Entwurf anpassen (Bearbeiten).";
  }
  if (documentDate < startOfYearBerlinIsoDate()) {
    return "Das Datum liegt vor dem 1. Januar des laufenden Jahres. Vor dem Festschreiben das Datum im Entwurf "
      + "anpassen (Bearbeiten).";
  }
  return null;
}
