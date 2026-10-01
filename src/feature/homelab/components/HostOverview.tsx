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

interface HostOverviewProps {
    hosts: Host[];
}

const sparklineConfig: ChartConfig = {
    value: { label: "Usage", color: "hsl(var(--primary))" },
};

function usageColor(percent: number): string {
    if (percent >= 85) return "text-rose-500";
    if (percent >= 70) return "text-amber-500";
    return "text-emerald-500";
}

function GaugeRow({ icon: Icon, label, percent, detail }: { icon: typeof Cpu; label: string; percent: number; detail: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                </span>
                <span className={cn("font-medium tabular-nums", usageColor(percent))}>{percent}%</span>
            </div>
            <Progress value={percent} className="h-1.5" />
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Host Overview</h2>
                <Select value={selectedHostId} onValueChange={setSelectedHostId}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All hosts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All hosts</SelectItem>
                        {hosts.map((host) => (
                            <SelectItem key={host.id} value={host.id}>
                                {host.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {visibleHosts.map((host) => (
                    <Card key={host.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{host.name}</CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    Uptime {formatUptime(host.uptimeSeconds)}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <GaugeRow
                                    icon={Cpu}
                                    label="CPU"
                                    percent={host.cpuUsagePercent}
                                    detail={`Load ${host.loadAverage.join(" / ")}`}
                                />
                                <GaugeRow
                                    icon={MemoryStick}
                                    label="Memory"
                                    percent={host.memoryUsagePercent}
                                    detail={`${host.memoryUsedGb.toFixed(1)} / ${host.memoryTotalGb} GB`}
                                />
                                <GaugeRow
                                    icon={HardDrive}
                                    label="Disk"
                                    percent={host.diskUsagePercent}
                                    detail={`${(host.diskUsedGb / 1000).toFixed(1)} / ${(host.diskTotalGb / 1000).toFixed(1)} TB`}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <span className="text-xs text-muted-foreground">CPU (last 12h)</span>
                                    <Sparkline data={host.metrics.cpu} />
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Memory (last 12h)</span>
                                    <Sparkline data={host.metrics.memory} />
                                </div>
                            </div>

                            {host.temperatureCelsius !== null && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Thermometer className="h-3.5 w-3.5" />
                                    {host.temperatureCelsius}°C
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
