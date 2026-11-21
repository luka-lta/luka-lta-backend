import { z } from "zod";
import type { LineItemInput } from "@/feature/business-documents/lineItems.ts";

export const offerStatusSchema = z.enum(["draft", "sent", "accepted", "rejected"]);

/** Position in der API-Antwort (`LineItem::toArray`); Menge als Punkt-String ("1.5"). */
export const offerLineItemSchema = z.object({
  position: z.number().int(),
  description: z.string(),
  quantity: z.string(),
  unit: z.string(),
  unitPriceCents: z.number().int(),
  lineTotalCents: z.number().int(),
});

/** `Offer::toArray`; Daten als "yyyy-MM-dd", createdAt als SQL-UTC. */
export const offerSchema = z.object({
  offerId: z.string(),
  offerNumber: z.string().nullable(),
  status: offerStatusSchema,
  customerId: z.string(),
  customerName: z.string(),
  offerDate: z.string(),
  validUntil: z.string(),
  introText: z.string().nullable(),
  closingText: z.string().nullable(),
  items: z.array(offerLineItemSchema),
  totalCents: z.number().int(),
  hasPdf: z.boolean(),
  depositInvoiceId: z.string().nullable(),
  finalInvoiceId: z.string().nullable(),
  createdAt: z.string().nullable(),
});

export const offerListSchema = z.object({
  offers: z.array(offerSchema),
});

export const offerResultSchema = z.object({
  offer: offerSchema,
});

export type OfferStatus = z.infer<typeof offerStatusSchema>;
export type OfferLineItem = z.infer<typeof offerLineItemSchema>;
export type Offer = z.infer<typeof offerSchema>;

/**
 * Request-Body für POST/PATCH /offers. `closingText` fehlt beim Anlegen, wenn der Standardtext aus den
 * Firmendaten gelten soll; `null` bedeutet "kein Schlusstext".
 */
export interface OfferInput {
  customerId: string;
  offerDate: string;
  validUntil: string;
  introText: string | null;
  closingText?: string | null;
  items: LineItemInput[];
}

/** Listenfilter; `undefined` = nicht filtern. */
export interface OfferFilters {
  status?: OfferStatus;
  customerId?: string;
  year?: number;
}
