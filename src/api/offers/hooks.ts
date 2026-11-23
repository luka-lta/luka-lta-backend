import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOffer,
  deleteOffer,
  duplicateOffer,
  getOffer,
  getOffers,
  sendOffer,
  setOfferStatus,
  updateOffer,
} from "@/api/offers/endpoints.ts";
import type { OfferFilters, OfferInput, OfferStatus } from "@/feature/offers/schema/offer.ts";

export function useOffers(filters: OfferFilters) {
  return useQuery({
    queryKey: ["offers", "list", filters],
    queryFn: () => getOffers(filters),
  });
}

export function useOffer(offerId: string | null) {
  return useQuery({
    queryKey: ["offers", "detail", offerId],
    queryFn: () => getOffer(offerId as string),
    enabled: offerId !== null,
  });
}

/** Alle Mutationen laden Listen und Details neu (Status und Nummer ändern sich serverseitig). */
function useInvalidateOffers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["offers"] });
}

export function useCreateOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation({ mutationFn: createOffer, onSuccess: invalidate });
}

export function useUpdateOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: OfferInput }) => updateOffer(offerId, data),
    onSuccess: invalidate,
  });
}

export function useDeleteOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation({ mutationFn: deleteOffer, onSuccess: invalidate });
}

export function useSendOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation({ mutationFn: sendOffer, onSuccess: invalidate });
}

export function useSetOfferStatus() {
  const invalidate = useInvalidateOffers();
  return useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: Extract<OfferStatus, "accepted" | "rejected"> }) =>
      setOfferStatus(offerId, status),
    onSuccess: invalidate,
  });
}

export function useDuplicateOffer() {
  const invalidate = useInvalidateOffers();
  return useMutation({ mutationFn: duplicateOffer, onSuccess: invalidate });
}
