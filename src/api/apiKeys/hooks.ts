import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createApiKey, CreateApiKeyInput, deleteApiKey, fetchApiKeys, fetchPermissions } from "@/api/apiKeys/endpoints.ts";

export function useApiKeys() {
    return useQuery({
        queryKey: ["apiKeys", "list"],
        queryFn: fetchApiKeys,
    });
}

export function usePermissions() {
    return useQuery({
        queryKey: ["permissions", "list"],
        queryFn: fetchPermissions,
    });
}

export function useCreateApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateApiKeyInput) => createApiKey(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["apiKeys", "list"] }),
    });
}

export function useDeleteApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (keyId: number) => deleteApiKey(keyId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["apiKeys", "list"] }),
    });
}
