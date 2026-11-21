import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveCustomer,
  createCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from "@/api/customers/endpoints.ts";
import type { CustomerInput } from "@/feature/customers/schema/customer.ts";

export function useCustomers(includeArchived: boolean) {
  return useQuery({
    queryKey: ["customers", "list", includeArchived],
    queryFn: () => getCustomers(includeArchived),
  });
}

export function useCustomer(customerId: string | null) {
  return useQuery({
    queryKey: ["customers", "detail", customerId],
    queryFn: () => getCustomer(customerId as string),
    enabled: customerId !== null,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: CustomerInput }) =>
      updateCustomer(customerId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useArchiveCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}
