import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";
import { Area, AreaChart } from "recharts";
import { Cpu, HardDrive, MemoryStick, Thermometer } from "lucide-react";
import type { Host } from "@/feature/homelab/types.ts";
import { formatUptime } from "@/feature/homelab/data.ts";
import { cn } from "@/lib/utils.ts";
import { usageTone } from "@/feature/homelab/status.ts";
import { PageSection } from "@/components/layout/page.tsx";

interface HostOverviewProps {
    hosts: Host[];
}

const sparklineConfig: ChartConfig = {
    value: { label: "Auslastung", color: "hsl(var(--chart-1))" },
};

function GaugeRow({ icon: Icon, label, percent, detail }: { icon: typeof Cpu; label: string; percent: number; detail: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="size-3.5" aria-hidden />
                    {label}
                </span>
                <span className={cn("font-medium tabular-nums", usageTone(percent))}>{percent} %</span>
            </div>
            <Progress value={percent} className="h-1.5" aria-label={`${label}: ${percent} %`} />
            <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
    );
}

function Sparkline({ data }: { data: { timestamp: string; value: number }[] }) {
    return (
        <ChartContainer config={sparklineConfig} className="h-16 w-full">
            <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    fill="var(--color-value)"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ChartContainer>
    );
}

export function HostOverview({ hosts }: HostOverviewProps) {
    const [selectedHostId, setSelectedHostId] = useState<string>("all");

    const visibleHosts = selectedHostId === "all" ? hosts : hosts.filter((h) => h.id === selectedHostId);

    return (
        <PageSection
            title="Hosts"
            actions={
                hosts.length > 1 ? (
                    <Select value={selectedHostId} onValueChange={setSelectedHostId}>
                        <SelectTrigger className="w-44" aria-label="Host auswählen">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Hosts</SelectItem>
                            {hosts.map((host) => (
                                <SelectItem key={host.id} value={host.id}>
                                    {host.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : undefined
            }
        >
            <div className="grid gap-4 lg:grid-cols-2">
                {visibleHosts.map((host) => (
                    <Card key={host.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle>{host.name}</CardTitle>
                                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {host.temperatureCelsius !== null && (
                                        <span className="flex items-center gap-1">
                                            <Thermometer className="size-3.5" aria-hidden />
                                            {host.temperatureCelsius} °C
                                        </span>
                                    )}
                                    <span>Uptime {formatUptime(host.uptimeSeconds)}</span>
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <GaugeRow
                                    icon={Cpu}
                                    label="CPU"
                                    percent={host.cpuUsagePercent}
                                    detail={`Load ${host.loadAverage.join(" / ")}`}
                                />
                                <GaugeRow
                                    icon={MemoryStick}
                                    label="RAM"
                                    percent={host.memoryUsagePercent}
                                    detail={`${host.memoryUsedGb.toLocaleString("de-DE", { maximumFractionDigits: 1 })} / ${host.memoryTotalGb} GB`}
                                />
                                <GaugeRow
                                    icon={HardDrive}
                                    label="Disk"
                                    percent={host.diskUsagePercent}
                                    detail={`${(host.diskUsedGb / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })} / ${(host.diskTotalGb / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })} TB`}
                                />
                            </div>

                            <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
                                <div>
                                    <span className="text-xs text-muted-foreground">CPU · letzte 12 h</span>
                                    <Sparkline data={host.metrics.cpu} />
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">RAM · letzte 12 h</span>
                                    <Sparkline data={host.metrics.memory} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </PageSection>
    );
}
