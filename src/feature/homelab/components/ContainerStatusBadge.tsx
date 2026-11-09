import { StatusBadge } from "@/components/feedback/status-badge.tsx";
import type { ContainerStatus, HealthStatus } from "@/feature/homelab/types.ts";
import { CONTAINER_STATUS, HEALTH_STATUS } from "@/feature/homelab/status.ts";

export function ContainerStatusBadge({ status }: { status: ContainerStatus }) {
    const mapped = CONTAINER_STATUS[status];
    return <StatusBadge tone={mapped.tone}>{mapped.label}</StatusBadge>;
}

export function HealthBadge({ status }: { status: HealthStatus }) {
    const mapped = HEALTH_STATUS[status];
    return <StatusBadge tone={mapped.tone}>{mapped.label}</StatusBadge>;
}
