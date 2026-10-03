import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWeatherDetail, fetchWeatherLocation, fetchWeatherSummary, updateWeatherLocation } from "@/api/weather/endpoints.ts";

const REFRESH_INTERVAL_MS = 5 * 60_000;

export function useWeatherSummary() {
    return useQuery({
        queryKey: ["weather", "summary"],
        queryFn: fetchWeatherSummary,
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}

export function useWeatherDetail(enabled: boolean) {
    return useQuery({
        queryKey: ["weather", "detail"],
        queryFn: fetchWeatherDetail,
        refetchInterval: REFRESH_INTERVAL_MS,
        enabled,
    });
}

export function useWeatherLocation() {
    return useQuery({
        queryKey: ["weather", "location"],
        queryFn: fetchWeatherLocation,
    });
}

export function useUpdateWeatherLocation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWeatherLocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["weather"] });
        },
    });
}
