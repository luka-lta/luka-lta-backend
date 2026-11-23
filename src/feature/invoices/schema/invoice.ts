import { z } from "zod";
import type { LineItemInput } from "@/feature/business-documents/lineItems.ts";

/** `InvoiceStatus` der API; `issued` = festgeschriebene Stornorechnung. */
export const invoiceStatusSchema = z.enum(["draft", "open", "paid", "cancelled", "issued"]);
/** `InvoiceKind` der API. */
export const invoiceKindSchema = z.enum(["standard", "deposit", "final", "cancellation"]);

/** Position in der API-Antwort (`LineItem::toArray`); Menge als Punkt-String ("1.5"). */
export const invoiceLineItemSchema = z.object({
  position: z.number().int(),
  description: z.string(),
  quantity: z.string(),
  unit: z.string(),
  unitPriceCents: z.number().int(),
  lineTotalCents: z.number().int(),
});

/**
 * `Invoice::toArray`; Daten als "yyyy-MM-dd". Bei Stornos sind alle Beträge negativ, `depositDeductionCents`
 * ebenfalls (−Anzahlung), `dueDate` ist dort null.
 */
export const invoiceSchema = z.object({
  invoiceId: z.string(),
  invoiceNumber: z.string().nullable(),
  kind: invoiceKindSchema,
  status: invoiceStatusSchema,
  customerId: z.string(),
  customerName: z.string(),
  offerId: z.string().nullable(),
  offerNumber: z.string().nullable(),
  depositInvoiceId: z.string().nullable(),
  depositInvoiceNumber: z.string().nullable(),
  cancelsInvoiceId: z.string().nullable(),
  cancelsInvoiceNumber: z.string().nullable(),
  invoiceDate: z.string(),
  serviceDate: z.string().nullable(),
  servicePeriodStart: z.string().nullable(),
  servicePeriodEnd: z.string().nullable(),
  paymentTermDays: z.number().int(),
  dueDate: z.string().nullable(),
  introText: z.string().nullable(),
  closingText: z.string().nullable(),
  items: z.array(invoiceLineItemSchema),
  subtotalCents: z.number().int(),
  depositDeductionCents: z.number().int(),
  totalCents: z.number().int(),
  paidAt: z.string().nullable(),
  isImported: z.boolean(),
  isOverdue: z.boolean(),
  isLocked: z.boolean(),
  lockReason: z.string().nullable(),
  hasPdf: z.boolean(),
  createdAt: z.string().nullable(),
});

export const invoiceListSchema = z.object({
  invoices: z.array(invoiceSchema),
});

export const invoiceResultSchema = z.object({
  invoice: invoiceSchema,
});

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type InvoiceKind = z.infer<typeof invoiceKindSchema>;
export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

/**
 * Request-Body für POST /invoices und PATCH /invoices/{id}. Entweder `serviceDate` oder Zeitraum; der jeweils
 * andere Teil wird als null mitgeschickt, damit die API ihn leert. `closingText` fehlt beim Anlegen, wenn der
 * Standardtext gelten soll; `paymentTermDays` fehlt beim Anlegen, wenn der Standard aus den Firmendaten gelten soll.
 */
export interface InvoiceInput {
  customerId: string;
  invoiceDate: string;
  serviceDate: string | null;
  servicePeriodStart: string | null;
  servicePeriodEnd: string | null;
  paymentTermDays?: number;
  introText: string | null;
  closingText?: string | null;
  /** Fehlt bei Anzahlungsentwürfen: Die API lehnt `items` dort mit 400 ab. */
  items?: LineItemInput[];
}

/** Body für POST /offers/{offerId}/invoices: bei Anzahlung genau eins von Betrag oder Prozent. */
export type CreateFromOfferInput =
  | { kind: "standard" | "final" }
  | { kind: "deposit"; amountCents: number }
  | { kind: "deposit"; percent: number };

/** Multipart-Felder für POST /invoices/import; null = Feld wird nicht gesendet. */
export interface ImportInvoiceInput {
  customerId: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: "open" | "paid";
  dueDate: string | null;
  paidAt: string | null;
  serviceDate: string | null;
  totalCents: number;
  file: File;
  /** Bestätigter Nummernsprung: sendet `allowNumberJump=1` (sonst antwortet die API bei einem Sprung mit 409). */
  allowNumberJump?: boolean;
}

/** Listenfilter; `undefined` = nicht filtern. `overdue: 1` = nur offene, überfällige Rechnungen. */
export interface InvoiceFilters {
  status?: InvoiceStatus;
  customerId?: string;
  year?: number;
  overdue?: 1;
}
