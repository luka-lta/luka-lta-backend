import api from "@/api/axios.ts";
import {
  offerListSchema,
  offerResultSchema,
  type Offer,
  type OfferFilters,
  type OfferInput,
  type OfferStatus,
} from "@/feature/offers/schema/offer.ts";

export async function getOffers(filters: OfferFilters): Promise<Offer[]> {
  const response = await api.get("/offers", { params: filters });
  return offerListSchema.parse(response.data.data).offers;
}

export async function getOffer(offerId: string): Promise<Offer> {
  const response = await api.get(`/offers/${offerId}`);
  return offerResultSchema.parse(response.data.data).offer;
}

export async function createOffer(data: OfferInput): Promise<Offer> {
  const response = await api.post("/offers", data);
  return offerResultSchema.parse(response.data.data).offer;
}

/** Nur Entwürfe. */
export async function updateOffer(offerId: string, data: OfferInput): Promise<Offer> {
  const response = await api.patch(`/offers/${offerId}`, data);
  return offerResultSchema.parse(response.data.data).offer;
}

/** Nur Entwürfe; die Antwort enthält keinen Payload. */
export async function deleteOffer(offerId: string): Promise<void> {
  await api.delete(`/offers/${offerId}`);
}

/** Draft → sent: vergibt die Nummer und legt das PDF ab (unumkehrbar). */
export async function sendOffer(offerId: string): Promise<Offer> {
  const response = await api.post(`/offers/${offerId}/send`);
  return offerResultSchema.parse(response.data.data).offer;
}

/** Nur aus "sent" heraus. */
export async function setOfferStatus(offerId: string, status: Extract<OfferStatus, "accepted" | "rejected">): Promise<Offer> {
  const response = await api.post(`/offers/${offerId}/status`, { status });
  return offerResultSchema.parse(response.data.data).offer;
}

export async function duplicateOffer(offerId: string): Promise<Offer> {
  const response = await api.post(`/offers/${offerId}/duplicate`);
  return offerResultSchema.parse(response.data.data).offer;
}

/** Pfad für `downloadPdf` (Entwurf: Vorschau mit Wasserzeichen, sonst gespeichertes PDF). */
export function getOfferPdfPath(offerId: string): string {
  return `/offers/${offerId}/pdf`;
}
