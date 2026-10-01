import { KpiCard } from "@/components/KpiCard.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import { CheckCircle2, Container as ContainerIcon, OctagonX, Server, TriangleAlert } from "lucide-react";
import type { Container, Host } from "@/feature/homelab/types.ts";
import { formatUptime, overallUptimeSeconds } from "@/feature/homelab/data.ts";

interface SummaryKpisProps {
    containers: Container[];
    hosts: Host[];
}

export function SummaryKpis({ containers, hosts }: SummaryKpisProps) {
    const running = containers.filter((c) => c.status === "running").length;
    const stopped = containers.filter((c) => c.status === "stopped").length;
    const errored = containers.filter((c) => c.status === "warning" || c.status === "unhealthy").length;

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard
                title="Hosts"
                value={hosts.length}
                icon={Server}
                iconBg="bg-sky-500/10"
                iconColor="text-sky-500"
            />
            <KpiCard
                title="Containers"
                value={containers.length}
                icon={ContainerIcon}
                iconBg="bg-violet-500/10"
                iconColor="text-violet-500"
            />
            <KpiCard
                title="Running"
                value={running}
                icon={CheckCircle2}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-500"
            />
            <KpiCard
                title="Stopped"
                value={stopped}
                icon={OctagonX}
                iconBg="bg-slate-500/10"
                iconColor="text-slate-500"
            />
            <KpiCard
                title="Needs attention"
                value={errored}
                icon={TriangleAlert}
                iconBg="bg-rose-500/10"
                iconColor="text-rose-500"
            />
            <Card className="relative transition-all duration-150">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Shortest uptime</span>
                        <div className={cn("p-2 rounded-lg shrink-0", "bg-amber-500/10")}>
                            <Server className={cn("h-4 w-4", "text-amber-500")} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{formatUptime(overallUptimeSeconds(hosts))}</p>
                </CardContent>
            </Card>
        </div>
    );
}
