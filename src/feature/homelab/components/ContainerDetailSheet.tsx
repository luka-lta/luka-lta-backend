import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { CopyButton } from "@/components/CopyButton.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { TimeCell } from "@/components/TimeCell.tsx";
import { ContainerStatusBadge, HealthBadge } from "@/feature/homelab/components/ContainerStatusBadge.tsx";
import type { Container, Host } from "@/feature/homelab/types.ts";
import { formatUptime } from "@/feature/homelab/data.ts";
import { useUpdateContainerNodeRole } from "@/api/homelab/topologyHooks.ts";
import { RotateCcw } from "lucide-react";

interface ContainerDetailSheetProps {
    open: boolean;
    container: Container | null;
    host: Host | undefined;
    isLoading: boolean;
    onOpenChange: (open: boolean) => void;
}

const metricChartConfig: ChartConfig = {
    value: { label: "Usage", color: "hsl(var(--primary))" },
};

function MetricChart({ data, unit }: { data: { timestamp: string; value: number }[]; unit: string }) {
    return (
        <ChartContainer config={metricChartConfig} className="h-40 w-full">
            <AreaChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    minTickGap={40}
                    fontSize={11}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                            formatter={(value) => [`${value}${unit}`, ""]}
                        />
                    }
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
            </AreaChart>
        </ChartContainer>
    );
}

export function ContainerDetailSheet({ open, container, host, isLoading, onOpenChange }: ContainerDetailSheetProps) {
    const updateNodeRole = useUpdateContainerNodeRole();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
                {container && (
                    <>
                        <SheetHeader className="px-0">
                            <div className="flex items-center gap-2">
                                <SheetTitle className="text-xl">{container.name}</SheetTitle>
                                <ContainerStatusBadge status={container.status} />
                            </div>
                            <SheetDescription className="flex items-center gap-1.5">
                                {container.image}
                                <CopyButton value={container.image} />
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-muted-foreground text-xs">Host</p>
                                <p className="font-medium">{host?.name ?? container.hostId}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Uptime</p>
                                <p className="font-medium">{formatUptime(container.uptimeSeconds)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Health</p>
                                <p className="font-medium"><HealthBadge status={container.healthStatus} /></p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Restarts</p>
                                <p className="font-medium">{container.restartCount}</p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <Tabs defaultValue="metrics">
                            <TabsList className="h-9">
                                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                                <TabsTrigger value="health">Health & restarts</TabsTrigger>
                                <TabsTrigger value="logs">Logs</TabsTrigger>
                                <TabsTrigger value="config">Config</TabsTrigger>
                            </TabsList>

                            <TabsContent value="metrics" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">CPU</span>
                                            <span className="font-medium tabular-nums">{container.cpuUsagePercent.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={container.cpuUsagePercent} className="h-1.5" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Memory</span>
                                            <span className="font-medium tabular-nums">
                                                {container.memoryUsedMb} / {container.memoryLimitMb} MB
                                            </span>
                                        </div>
                                        <Progress value={(container.memoryUsedMb / container.memoryLimitMb) * 100} className="h-1.5" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">CPU history</p>
                                    <MetricChart data={container.cpuHistory} unit="%" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Memory history</p>
                                    <MetricChart data={container.memoryHistory} unit="%" />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Network In</span>
                                    <span className="font-medium tabular-nums">{container.networkInMbps.toFixed(1)} Mbps</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Network Out</span>
                                    <span className="font-medium tabular-nums">{container.networkOutMbps.toFixed(1)} Mbps</span>
                                </div>
                            </TabsContent>

                            <TabsContent value="health" className="space-y-4 pt-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Health checks</p>
                                    <ul className="space-y-2">
                                        {container.healthCheckHistory.map((check, i) => (
                                            <li key={i} className="flex items-start justify-between text-sm border-b pb-2 last:border-0">
                                                <div>
                                                    <HealthBadge status={check.status} />
                                                    <p className="text-muted-foreground text-xs mt-0.5">{check.message}</p>
                                                </div>
                                                <TimeCell iso={check.timestamp} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Restart history
                                    </p>
                                    {container.restartHistory.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No restarts recorded.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {container.restartHistory.map((event, i) => (
                                                <li key={i} className="flex items-start justify-between text-sm border-b pb-2 last:border-0">
                                                    <span>{event.reason}</span>
                                                    <TimeCell iso={event.timestamp} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="logs" className="pt-4">
                                <div className="rounded-md bg-muted/50 border p-3 font-mono text-xs space-y-1.5 max-h-80 overflow-y-auto">
                                    {container.logs.map((line, i) => (
                                        <div key={i} className="flex gap-2">
                                            <span className="text-muted-foreground shrink-0">
                                                {new Date(line.timestamp).toLocaleTimeString()}
                                            </span>
                                            <span
                                                className={
                                                    line.level === "error"
                                                        ? "text-rose-500"
                                                        : line.level === "warn"
                                                            ? "text-amber-500"
                                                            : "text-foreground"
                                                }
                                            >
                                                {line.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="config" className="space-y-4 pt-4 text-sm">
                                <div>
                                    <p className="font-medium mb-1.5">Topology role</p>
                                    <Select
                                        value={container.nodeRole ?? "unset"}
                                        onValueChange={(value) =>
                                            updateNodeRole.mutate({
                                                containerId: container.id,
                                                nodeRole: value === "unset" ? null : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unset">Default (container)</SelectItem>
                                            <SelectItem value="reverse-proxy">Reverse proxy</SelectItem>
                                            <SelectItem value="database">Database</SelectItem>
                                            <SelectItem value="application">Application</SelectItem>
                                            <SelectItem value="storage">Storage</SelectItem>
                                            <SelectItem value="monitoring">Monitoring</SelectItem>
                                            <SelectItem value="dns">DNS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Marking a container as "Reverse proxy" draws a route on the Topology map to
                                        every container exposing Traefik labels.
                                    </p>
                                </div>
                                {container.networks.length > 0 && (
                                    <div>
                                        <p className="font-medium mb-1.5">Networks</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {container.networks.map((network) => (
                                                <span key={network} className="rounded-md bg-muted px-2 py-1 text-xs font-mono">
                                                    {network}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium mb-1.5">Ports</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {container.ports.map((port) => (
                                            <span key={port} className="rounded-md bg-muted px-2 py-1 text-xs font-mono">{port}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium mb-1.5">Volumes</p>
                                    <div className="flex flex-col gap-1">
                                        {container.volumes.map((volume) => (
                                            <span key={volume} className="text-xs font-mono text-muted-foreground">{volume}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium mb-1.5">Environment</p>
                                    <div className="flex flex-col gap-1">
                                        {Object.entries(container.environment).map(([key, value]) => (
                                            <div key={key} className="flex justify-between gap-4 text-xs font-mono">
                                                <span className="text-muted-foreground">{key}</span>
                                                <span>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
