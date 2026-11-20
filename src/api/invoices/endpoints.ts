import api, { apiForm } from "@/api/axios.ts";
import {
  invoiceListSchema,
  invoiceResultSchema,
  type CreateFromOfferInput,
  type ImportInvoiceInput,
  type Invoice,
  type InvoiceFilters,
  type InvoiceInput,
} from "@/feature/invoices/schema/invoice.ts";

export async function getInvoices(filters: InvoiceFilters): Promise<Invoice[]> {
  const response = await api.get("/invoices", { params: filters });
  return invoiceListSchema.parse(response.data.data).invoices;
}

export async function getInvoice(invoiceId: string): Promise<Invoice> {
  const response = await api.get(`/invoices/${invoiceId}`);
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** Entwurf einer normalen Rechnung (ohne Angebot). */
export async function createInvoice(data: InvoiceInput): Promise<Invoice> {
  const response = await api.post("/invoices", data);
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** Nur Entwürfe. */
export async function updateInvoice(invoiceId: string, data: InvoiceInput): Promise<Invoice> {
  const response = await api.patch(`/invoices/${invoiceId}`, data);
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** Nur Entwürfe; die Antwort enthält keinen Payload. */
export async function deleteInvoice(invoiceId: string): Promise<void> {
  await api.delete(`/invoices/${invoiceId}`);
}

/** Draft → open (Storno: issued): vergibt die Nummer und legt das PDF ab (unumkehrbar). */
export async function finalizeInvoice(invoiceId: string): Promise<Invoice> {
  const response = await api.post(`/invoices/${invoiceId}/finalize`);
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** open → paid. */
export async function markInvoicePaid(invoiceId: string, paidAt: string): Promise<Invoice> {
  const response = await api.post(`/invoices/${invoiceId}/payment`, { paidAt });
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** paid → open. */
export async function unmarkInvoicePaid(invoiceId: string): Promise<Invoice> {
  const response = await api.delete(`/invoices/${invoiceId}/payment`);
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** Erzeugt und schreibt die Stornorechnung fest; liefert die Stornorechnung (nicht das Original). */
export async function cancelInvoice(invoiceId: string): Promise<Invoice> {
  const response = await api.post(`/invoices/${invoiceId}/cancel`);
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** Bestandsrechnung mit PDF als Multipart; leere optionale Felder werden nicht gesendet. */
export async function importInvoice(data: ImportInvoiceInput): Promise<Invoice> {
  const form = new FormData();
  form.append("customerId", data.customerId);
  form.append("invoiceNumber", data.invoiceNumber);
  form.append("invoiceDate", data.invoiceDate);
  form.append("status", data.status);
  form.append("totalCents", String(data.totalCents));
  if (data.dueDate !== null) form.append("dueDate", data.dueDate);
  if (data.paidAt !== null) form.append("paidAt", data.paidAt);
  if (data.serviceDate !== null) form.append("serviceDate", data.serviceDate);
  if (data.allowNumberJump === true) form.append("allowNumberJump", "1");
  form.append("file", data.file);
  const response = await apiForm.post("/invoices/import", form);
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** Rechnungsentwurf aus einem angenommenen Angebot (normal, Anzahlung oder Schlussrechnung). */
export async function createInvoiceFromOffer(offerId: string, data: CreateFromOfferInput): Promise<Invoice> {
  const response = await api.post(`/offers/${offerId}/invoices`, data);
  return invoiceResultSchema.parse(response.data.data).invoice;
}

/** Pfad für `downloadPdf` (Entwurf: Vorschau mit Wasserzeichen, sonst gespeichertes PDF). */
export function getInvoicePdfPath(invoiceId: string): string {
  return `/invoices/${invoiceId}/pdf`;
}
