import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBusinessSettings,
  saveBusinessSettings,
  uploadBusinessLogo,
} from "@/api/business-settings/endpoints.ts";

const BUSINESS_SETTINGS_KEY = ["business-settings"] as const;

export function useBusinessSettings() {
  return useQuery({
    queryKey: BUSINESS_SETTINGS_KEY,
    queryFn: getBusinessSettings,
  });
}

export function useSaveBusinessSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBusinessSettings,
    onSuccess: (settings) => queryClient.setQueryData(BUSINESS_SETTINGS_KEY, settings),
  });
}

export function useUploadBusinessLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadBusinessLogo,
    onSuccess: (settings) => queryClient.setQueryData(BUSINESS_SETTINGS_KEY, settings),
  });
}
