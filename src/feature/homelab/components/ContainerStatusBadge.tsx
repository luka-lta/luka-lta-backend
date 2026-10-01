import { Status, StatusIndicator, StatusLabel } from "@/components/ui/kibo-ui/status/index.tsx";
import type { ContainerStatus, HealthStatus } from "@/feature/homelab/types.ts";

const STATUS_MAP: Record<ContainerStatus, { status: "online" | "offline" | "maintenance" | "degraded"; label: string }> = {
    running: { status: "online", label: "Running" },
    stopped: { status: "offline", label: "Stopped" },
    warning: { status: "degraded", label: "Warning" },
    unhealthy: { status: "degraded", label: "Unhealthy" },
};

export function ContainerStatusBadge({ status }: { status: ContainerStatus }) {
    const mapped = STATUS_MAP[status];
    return (
        <Status status={mapped.status}>
            <StatusIndicator />
            <StatusLabel>{mapped.label}</StatusLabel>
        </Status>
    );
}

const HEALTH_LABEL: Record<HealthStatus, string> = {
    healthy: "Healthy",
    warning: "Warning",
    unhealthy: "Unhealthy",
    none: "N/A",
};

const HEALTH_CLASS: Record<HealthStatus, string> = {
    healthy: "text-emerald-500",
    warning: "text-amber-500",
    unhealthy: "text-rose-500",
    none: "text-muted-foreground",
};

export function HealthBadge({ status }: { status: HealthStatus }) {
    return <span className={HEALTH_CLASS[status]}>{HEALTH_LABEL[status]}</span>;
}
