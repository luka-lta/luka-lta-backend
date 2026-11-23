import { addDaysToIsoDate } from "@/lib/dateTimeUtils.ts";
import type { CreateFromOfferInput, Invoice, InvoiceKind } from "@/feature/invoices/schema/invoice.ts";
import type { Offer } from "@/feature/offers/schema/offer.ts";

/** Kurzbezeichnung der Rechnungsart für Listen und Kopfzeilen. */
export const KIND_LABELS: Record<InvoiceKind, string> = {
  standard: "Rechnung",
  deposit: "Anzahlung",
  final: "Schlussrechnung",
  cancellation: "Storno",
};

/** Englische Sperrgründe der API (`DepositInvoiceState`) → deutscher Hinweis. */
const LOCK_UNPAID_PATTERN = /^Deposit invoice (RE-\d{4}-\d{4,}) is not paid$/;
const LOCK_NOT_FINALIZED = "Deposit invoice is not finalized";

export function translateLockReason(reason: string): string {
  const unpaid = LOCK_UNPAID_PATTERN.exec(reason);
  if (unpaid !== null) return `Gesperrt: Anzahlung ${unpaid[1]} noch offen`;
  if (reason === LOCK_NOT_FINALIZED) return "Gesperrt: Anzahlung noch nicht festgeschrieben";
  return reason;
}

/** Ohne Leistungsdatum oder -zeitraum lehnt die API das Festschreiben ab (außer bei Stornos). */
export function isServiceInfoMissing(invoice: Invoice): boolean {
  if (invoice.kind === "cancellation") return false;
  return invoice.serviceDate === null && (invoice.servicePeriodStart === null || invoice.servicePeriodEnd === null);
}

/** Dateiname, falls der Browser `Content-Disposition` nicht lesen darf. */
export function getInvoicePdfFileName(invoice: Invoice): string {
  return invoice.invoiceNumber === null ? "Entwurf.pdf" : `${invoice.invoiceNumber}.pdf`;
}

/**
 * Bezeichnung der Abzugszeile. Der Wert wird immer als `-depositDeductionCents` angezeigt: bei Schlussrechnungen
 * negativ ("abzgl. Anzahlung -300,00 €"), bei Stornos positiv, weil die API dort −Anzahlung speichert.
 */
export function getDeductionLabel(invoice: Invoice): string {
  const base = invoice.kind === "cancellation" ? "Storno Abzug Anzahlung" : "abzgl. Anzahlung";
  return invoice.depositInvoiceNumber === null ? base : `${base} ${invoice.depositInvoiceNumber}`;
}

/** Tausendstel-Prozent je Prozent und 100 % in Tausendstel (wie `Percentage` in der API). */
const THOUSANDTHS_PER_PERCENT = 1000;
const HUNDRED_PERCENT_THOUSANDTHS = 100 * THOUSANDTHS_PER_PERCENT;
const PERCENT_PATTERN = /^(\d{1,2})(?:[.,](\d{1,3}))?$/;

/** Prozenteingabe ("33,333" oder "33.333") als Tausendstel-Prozent; nur 0 < p < 100 mit max. 3 Nachkommastellen. */
export function parsePercentThousandths(value: string): number | null {
  const match = PERCENT_PATTERN.exec(value.trim());
  if (match === null) return null;
  const thousandths = Number(match[1]) * THOUSANDTHS_PER_PERCENT + Number((match[2] ?? "").padEnd(3, "0"));
  if (thousandths <= 0 || thousandths >= HUNDRED_PERCENT_THOUSANDTHS) return null;
  return thousandths;
}

/** Tausendstel-Prozent als JSON-Zahl für die API (kürzeste Darstellung, z. B. 33.333). */
export function thousandthsToPercent(thousandths: number): number {
  return thousandths / THOUSANDTHS_PER_PERCENT;
}

/** Anteil wie `Percentage::applyTo` in der API: nur Integer-Arithmetik, kaufmännisch gerundet. */
export function applyPercentThousandths(totalCents: number, thousandths: number): number {
  const product = Math.abs(totalCents) * thousandths;
  const rounded = Math.floor((product + HUNDRED_PERCENT_THOUSANDTHS / 2) / HUNDRED_PERCENT_THOUSANDTHS);
  return totalCents < 0 ? -rounded : rounded;
}

/** Größter Betrag einer importierten Rechnung (signed INT in der Datenbank). */
export const MAX_IMPORT_TOTAL_CENTS = 2147483647;
/** 10 MiB in Bytes, Obergrenze der API für importierte PDFs. */
export const MAX_IMPORT_PDF_BYTES = 10 * 1024 * 1024;
/** Höchstes Zahlungsziel in Tagen (wie `Invoice` in der API). */
export const MAX_PAYMENT_TERM_DAYS = 365;

const INVOICE_NUMBER_PATTERN = /^RE-(\d{4})-(\d{4,})$/;

/**
 * Prüft eine Rechnungsnummer wie die API beim Import: Format RE-JJJJ-NNNN, kanonisch (keine überzähligen
 * führenden Nullen), Zähler ≥ 1, Jahr = Jahr des Rechnungsdatums. Liefert einen Fehlertext oder null.
 */
export function validateImportInvoiceNumber(invoiceNumber: string, invoiceDate: string): string | null {
  const match = INVOICE_NUMBER_PATTERN.exec(invoiceNumber);
  if (match === null) return "Rechnungsnummer muss das Format RE-JJJJ-NNNN haben";
  const sequence = match[2];
  if (Number(sequence) < 1) return "Der Zähler der Rechnungsnummer muss mindestens 1 sein";
  if (sequence.length > 4 && sequence.startsWith("0")) {
    return "Rechnungsnummer ohne überzählige führende Nullen angeben (z. B. RE-2026-0001)";
  }
  if (invoiceDate !== "" && match[1] !== invoiceDate.slice(0, 4)) {
    return "Das Jahr der Rechnungsnummer muss zum Rechnungsdatum passen";
  }
  return null;
}

/** Spätestes zulässiges Fälligkeitsdatum zu einem Rechnungsdatum. */
export function getLatestDueDate(invoiceDate: string): string {
  return addDaysToIsoDate(invoiceDate, MAX_PAYMENT_TERM_DAYS);
}

export type OfferInvoiceKind = CreateFromOfferInput["kind"];

/**
 * Welche Arten der Zustand des Angebots erlaubt (wie die API): höchstens eine aktive Anzahlung und keine neue
 * Anzahlung, sobald eine Schlussrechnung existiert; höchstens eine aktive Schlussrechnung; normale Rechnungen immer.
 */
export function getAllowedOfferInvoiceKinds(offer: Offer): OfferInvoiceKind[] {
  const kinds: OfferInvoiceKind[] = [];
  if (offer.depositInvoiceId === null && offer.finalInvoiceId === null) kinds.push("deposit");
  if (offer.finalInvoiceId === null) kinds.push("final");
  kinds.push("standard");
  return kinds;
}
