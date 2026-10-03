import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "@/api/notifications/endpoints.ts";

const REFRESH_INTERVAL_MS = 30_000;

export function useNotifications(limit = 50, offset = 0) {
    return useQuery({
        queryKey: ["notifications", "feed", limit, offset],
        queryFn: () => fetchNotifications(limit, offset),
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}

function useInvalidateNotifications() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ["notifications"] });
}

export function useMarkNotificationRead() {
    const invalidate = useInvalidateNotifications();
    return useMutation({
        mutationFn: (alertId: string) => markNotificationRead(alertId),
        onSuccess: invalidate,
    });
}

export function useMarkAllNotificationsRead() {
    const invalidate = useInvalidateNotifications();
    return useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: invalidate,
    });
}
