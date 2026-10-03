import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
    createCalendarSource,
    deleteCalendarSource,
    fetchCalendarEvents,
    fetchCalendarSources,
    fetchCalendarSummary,
    updateCalendarSource,
    type UpdateCalendarSourceData,
} from "@/api/calendar/endpoints.ts";

const REFRESH_INTERVAL_MS = 5 * 60_000;

export function useCalendarSummary() {
    return useQuery({
        queryKey: ["calendar", "summary"],
        queryFn: fetchCalendarSummary,
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}

export function useCalendarEvents(from: string, to: string, enabled: boolean) {
    return useQuery({
        queryKey: ["calendar", "events", from, to],
        queryFn: () => fetchCalendarEvents(from, to),
        enabled,
    });
}

export function useCalendarSources() {
    return useQuery({
        queryKey: ["calendar", "sources"],
        queryFn: fetchCalendarSources,
    });
}

export function useCreateCalendarSource() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCalendarSource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] });
        },
    });
}

export function useUpdateCalendarSource() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCalendarSourceData }) => updateCalendarSource(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] });
        },
    });
}

export function useDeleteCalendarSource() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCalendarSource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] });
        },
    });
}
