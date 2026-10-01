import type { Host } from "./types";

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
