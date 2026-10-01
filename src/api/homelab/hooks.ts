import { useQuery } from "@tanstack/react-query";
import {
    fetchAlerts,
    fetchContainer,
    fetchContainers,
    fetchHostMetrics,
    fetchHosts,
} from "@/api/homelab/endpoints.ts";
import type { Host } from "@/feature/homelab/types.ts";

const REFRESH_INTERVAL_MS = 30_000;

export function useHosts() {
    return useQuery({
        queryKey: ["homelab", "hosts"],
        queryFn: async (): Promise<Host[]> => {
            const hosts = await fetchHosts();

            return Promise.all(
                hosts.map(async (host) => {
                    const [cpu, memory, disk, networkIn, networkOut] = await Promise.all([
                        fetchHostMetrics(host.id, "cpu"),
                        fetchHostMetrics(host.id, "memory"),
                        fetchHostMetrics(host.id, "disk"),
                        fetchHostMetrics(host.id, "network_in"),
                        fetchHostMetrics(host.id, "network_out"),
                    ]);

                    return { ...host, metrics: { cpu, memory, disk, networkIn, networkOut } };
                }),
            );
        },
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}

export function useContainers() {
    return useQuery({
        queryKey: ["homelab", "containers"],
        queryFn: fetchContainers,
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}

export function useContainer(containerId: string | null) {
    return useQuery({
        queryKey: ["homelab", "container", containerId],
        queryFn: () => fetchContainer(containerId as string),
        enabled: containerId !== null,
    });
}

export function useAlerts() {
    return useQuery({
        queryKey: ["homelab", "alerts"],
        queryFn: fetchAlerts,
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}
