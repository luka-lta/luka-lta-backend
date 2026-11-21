import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvoice,
  createInvoice,
  createInvoiceFromOffer,
  deleteInvoice,
  finalizeInvoice,
  getInvoice,
  getInvoices,
  importInvoice,
  markInvoicePaid,
  unmarkInvoicePaid,
  updateInvoice,
} from "@/api/invoices/endpoints.ts";
import type { CreateFromOfferInput, InvoiceFilters, InvoiceInput } from "@/feature/invoices/schema/invoice.ts";

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: ["invoices", "list", filters],
    queryFn: () => getInvoices(filters),
  });
}

export function useInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: ["invoices", "detail", invoiceId],
    queryFn: () => getInvoice(invoiceId as string),
    enabled: invoiceId !== null,
  });
}

/**
 * Alle Mutationen laden Rechnungen und Angebote neu: Status, Nummern, Sperren und die Verweise
 * `depositInvoiceId`/`finalInvoiceId` am Angebot ändern sich serverseitig.
 */
function useInvalidateInvoices() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["invoices"] }),
      queryClient.invalidateQueries({ queryKey: ["offers"] }),
    ]);
}

export function useCreateInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({ mutationFn: createInvoice, onSuccess: invalidate });
}

export function useUpdateInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: InvoiceInput }) => updateInvoice(invoiceId, data),
    onSuccess: invalidate,
  });
}

export function useDeleteInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({ mutationFn: deleteInvoice, onSuccess: invalidate });
}

export function useFinalizeInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({ mutationFn: finalizeInvoice, onSuccess: invalidate });
}

export function useMarkInvoicePaid() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: ({ invoiceId, paidAt }: { invoiceId: string; paidAt: string }) => markInvoicePaid(invoiceId, paidAt),
    onSuccess: invalidate,
  });
}

export function useUnmarkInvoicePaid() {
  const invalidate = useInvalidateInvoices();
  return useMutation({ mutationFn: unmarkInvoicePaid, onSuccess: invalidate });
}

export function useCancelInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({ mutationFn: cancelInvoice, onSuccess: invalidate });
}

/** Multipart über `apiForm`. */
export function useImportInvoice() {
  const invalidate = useInvalidateInvoices();
  return useMutation({ mutationFn: importInvoice, onSuccess: invalidate });
}

export function useCreateInvoiceFromOffer() {
  const invalidate = useInvalidateInvoices();
  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: CreateFromOfferInput }) =>
      createInvoiceFromOffer(offerId, data),
    onSuccess: invalidate,
  });
}
