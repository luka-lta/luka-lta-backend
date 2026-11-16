import type { StatusTone } from "@/components/feedback/status-badge.tsx";
import type { AlertSeverity, ContainerStatus, HealthStatus } from "@/feature/homelab/types.ts";
import type { ServiceGroup } from "@/feature/homelab/data.ts";

export const CONTAINER_STATUS: Record<ContainerStatus, { label: string; tone: StatusTone }> = {
    running: { label: "Läuft", tone: "success" },
    stopped: { label: "Gestoppt", tone: "neutral" },
    warning: { label: "Warnung", tone: "warning" },
    unhealthy: { label: "Fehlerhaft", tone: "danger" },
};

export const HEALTH_STATUS: Record<HealthStatus, { label: string; tone: StatusTone }> = {
    healthy: { label: "Gesund", tone: "success" },
    warning: { label: "Warnung", tone: "warning" },
    unhealthy: { label: "Fehlerhaft", tone: "danger" },
    none: { label: "Kein Healthcheck", tone: "neutral" },
};

export const ALERT_SEVERITY: Record<AlertSeverity, { label: string; tone: StatusTone }> = {
    critical: { label: "Kritisch", tone: "danger" },
    warning: { label: "Warnung", tone: "warning" },
    info: { label: "Info", tone: "info" },
};

export const SERVICE_STATUS: Record<ServiceGroup["status"], { label: string; tone: StatusTone }> = {
    healthy: { label: "OK", tone: "success" },
    warning: { label: "Warnung", tone: "warning" },
    critical: { label: "Kritisch", tone: "danger" },
};

/** Farbe für Auslastungswerte (CPU, RAM, Disk). */
export function usageTone(percent: number): "text-destructive" | "text-warning" | "text-success" {
    if (percent >= 85) return "text-destructive";
    if (percent >= 70) return "text-warning";
    return "text-success";
}
