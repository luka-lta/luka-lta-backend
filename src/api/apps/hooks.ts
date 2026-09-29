import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createApp, deleteApp, fetchApp, fetchAppList, updateApp } from "@/api/apps/endpoints";
import type { AppInput } from "@/api/apps/schema";

export function useAppList() {
    return useQuery({
        queryKey: ["apps", "list"],
        queryFn: fetchAppList,
    });
}

export function useApp(id: string) {
    return useQuery({
        queryKey: ["apps", "detail", id],
        queryFn: () => fetchApp(id),
        enabled: !!id,
    });
}

export function useCreateApp() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: AppInput) => createApp(input),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["apps", "list"] }),
    });
}

export function useUpdateApp(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: AppInput) => updateApp(id, input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["apps", "list"] });
            qc.invalidateQueries({ queryKey: ["apps", "detail", id] });
        },
    });
}

export function useDeleteApp() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteApp(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["apps", "list"] }),
    });
}
