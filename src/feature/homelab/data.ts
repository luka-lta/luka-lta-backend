import { DateTime } from "luxon";
import type { Alert, Container, Event, Host } from "./types";

export function formatUptime(seconds: number | null): string {
    if (seconds === null) return "—";
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function overallUptimeSeconds(hosts: Host[]): number | null {
    if (hosts.length === 0) return null;
    return Math.min(...hosts.map((h) => h.uptimeSeconds));
}

/**
 * A container's own status only reflects what Docker reports right now (e.g.
 * "running"). A crash-looping container that happens to be up at poll time still
 * looks "running" — the active alert is what actually says something is wrong.
 * Any open alert counts as a problem, independent of container status.
 */
export function hasActiveProblems(containers: Container[], alerts: Alert[]): boolean {
    if (alerts.length > 0) return true;
    return containers.some((c) => c.status === "warning" || c.status === "unhealthy");
}

const COMPOSE_PROJECT_LABEL = "com.docker.compose.project";

/**
 * Containers from the same `docker compose` project are one service to operate
 * (e.g. Immich's server + machine-learning + redis containers). Containers
 * without that label (standalone `docker run`) are their own singleton "service"
 * keyed by container id, so nothing gets silently dropped from the grouping.
 */
export function getComposeProjectKey(container: Container): string {
    return container.labels[COMPOSE_PROJECT_LABEL] ?? `container:${container.id}`;
}

export interface ServiceGroup {
    id: string;
    name: string;
    containers: Container[];
    status: "healthy" | "warning" | "critical";
}

export function groupContainersByService(containers: Container[], alerts: Alert[]): ServiceGroup[] {
    const alertedContainerIds = new Set(alerts.map((a) => a.containerId).filter((id): id is string => Boolean(id)));
    const groups = new Map<string, Container[]>();

    for (const container of containers) {
        const key = getComposeProjectKey(container);
        const members = groups.get(key) ?? [];
        members.push(container);
        groups.set(key, members);
    }

    return Array.from(groups.entries())
        .map(([key, members]) => {
            const name = key.startsWith("container:") ? members[0].name : key;
            const hasCritical = members.some((c) => c.status === "unhealthy");
            const hasWarning = members.some((c) => c.status === "warning" || alertedContainerIds.has(c.id));
            const status: ServiceGroup["status"] = hasCritical ? "critical" : hasWarning ? "warning" : "healthy";

            return { id: key, name, containers: members, status };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The API returns SQL-style ("yyyy-MM-dd HH:mm:ss") UTC timestamps with no zone
 * marker — parse as UTC like the rest of the app (see dateTimeUtils.ts) before
 * comparing against a wall-clock cutoff.
 */
export function countEventsSince(events: Event[], type: string, hoursAgo: number): number {
    const cutoff = DateTime.utc().minus({ hours: hoursAgo });

    return events.filter((e) => {
        if (e.type !== type) return false;
        const occurredAt = DateTime.fromSQL(e.occurredAt, { zone: "utc" });
        return occurredAt.isValid && occurredAt >= cutoff;
    }).length;
}

export interface ExposedPort {
    hostPort: string;
    containerPort: string;
    containerId: string;
    containerName: string;
    hostId: string;
}

/**
 * Flattens every container's `HostPort:ContainerPort` bindings into one list
 * across the fleet, sorted by host port — this is what "what's actually
 * reachable from outside right now" looks like without clicking into every
 * container individually.
 */
export function listExposedPorts(containers: Container[]): ExposedPort[] {
    const ports: ExposedPort[] = [];

    for (const container of containers) {
        for (const binding of container.ports) {
            const [hostPort, containerPort] = binding.split(":");
            if (!hostPort || !containerPort) continue;

            ports.push({
                hostPort,
                containerPort,
                containerId: container.id,
                containerName: container.name,
                hostId: container.hostId,
            });
        }
    }

    return ports.sort((a, b) => Number(a.hostPort) - Number(b.hostPort));
}

export function countNeedsAttention(containers: Container[], alerts: Alert[]): number {
    const alertedContainerIds = new Set(alerts.map((a) => a.containerId).filter((id): id is string => Boolean(id)));
    const alertedHostIds = new Set(alerts.map((a) => a.hostId).filter((id): id is string => Boolean(id)));

    const affectedContainers = containers.filter(
        (c) => c.status === "warning" || c.status === "unhealthy" || alertedContainerIds.has(c.id),
    ).length;

    return affectedContainers + alertedHostIds.size;
}
