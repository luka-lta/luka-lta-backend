import api from "@/api/axios.ts";
import {
    alertListSchema,
    containerDetailSchema,
    containerListSchema,
    hostListSchema,
    hostMetricsSchema,
} from "@/api/homelab/schema.ts";
import type { Container, Host, MetricPoint } from "@/feature/homelab/types.ts";

export type HostMetricType = "cpu" | "memory" | "disk" | "network_in" | "network_out";
export type ContainerMetricType = "cpu" | "memory";

export async function fetchHosts(): Promise<Omit<Host, "metrics">[]> {
    const response = await api.get("/homelab/hosts");
    return hostListSchema.parse(response.data.data).hosts;
}

export async function fetchHostMetrics(
    hostId: string,
    metric: HostMetricType,
    rangeMinutes = 12 * 60,
): Promise<MetricPoint[]> {
    const response = await api.get(`/homelab/hosts/${hostId}/metrics`, {
        params: { metric, rangeMinutes },
    });
    return hostMetricsSchema.parse(response.data.data).metrics;
}

export async function fetchContainers(): Promise<Container[]> {
    const response = await api.get("/homelab/containers");
    return containerListSchema.parse(response.data.data).containers;
}

export async function fetchContainer(containerId: string): Promise<Container> {
    const response = await api.get(`/homelab/containers/${containerId}`);
    return containerDetailSchema.parse(response.data.data).container;
}

export async function fetchContainerMetrics(
    containerId: string,
    metric: ContainerMetricType,
    rangeMinutes = 12 * 60,
): Promise<MetricPoint[]> {
    const response = await api.get(`/homelab/containers/${containerId}/metrics`, {
        params: { metric, rangeMinutes },
    });
    return hostMetricsSchema.parse(response.data.data).metrics;
}

export async function fetchAlerts() {
    const response = await api.get("/homelab/alerts");
    return alertListSchema.parse(response.data.data).alerts;
}
