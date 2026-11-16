import { CheckCircle2, Clock, Container as ContainerIcon, OctagonX, Server, TriangleAlert } from "lucide-react";
import { StatCard } from "@/components/data/stat-card.tsx";
import type { Alert, Container, Event, Host } from "@/feature/homelab/types.ts";
import { countEventsSince, countNeedsAttention, formatUptime, overallUptimeSeconds } from "@/feature/homelab/data.ts";

interface SummaryKpisProps {
    containers: Container[];
    hosts: Host[];
    alerts: Alert[];
    events: Event[];
}

export function SummaryKpis({ containers, hosts, alerts, events }: SummaryKpisProps) {
    const running = containers.filter((c) => c.status === "running").length;
    const stopped = containers.filter((c) => c.status === "stopped").length;
    const needsAttention = countNeedsAttention(containers, alerts);
    const newIssuesLast24h = countEventsSince(events, "alert.created", 24);

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Hosts" value={hosts.length} icon={Server} />
            <StatCard label="Container" value={containers.length} icon={ContainerIcon} href="/dashboard/homelab/containers" />
            <StatCard label="Laufen" value={running} icon={CheckCircle2} tone={running > 0 ? "success" : "default"} />
            <StatCard label="Gestoppt" value={stopped} icon={OctagonX} />
            <StatCard
                label="Auffällig"
                value={needsAttention}
                icon={TriangleAlert}
                tone={needsAttention > 0 ? "danger" : "default"}
                hint={newIssuesLast24h > 0 ? `+${newIssuesLast24h} neu in 24 h` : "Nichts Neues in 24 h"}
            />
            <StatCard label="Kürzeste Uptime" value={formatUptime(overallUptimeSeconds(hosts))} icon={Clock} />
        </div>
    );
}
