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
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DetailList } from "@/components/data/detail-list.tsx";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { cn } from "@/lib/utils.ts";

interface ContainerDetailSheetProps {
    open: boolean;
    container: Container | null;
    host: Host | undefined;
    isLoading: boolean;
    onOpenChange: (open: boolean) => void;
}

const metricChartConfig: ChartConfig = {
    value: { label: "Auslastung", color: "hsl(var(--chart-1))" },
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
                    tickFormatter={(v) => new Date(v).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                    minTickGap={40}
                    fontSize={11}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            labelFormatter={(v) => new Date(v).toLocaleTimeString("de-DE")}
                            formatter={(value) => [`${value} ${unit}`, ""]}
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
            <SheetContent side="right" className="w-full sm:max-w-xl">
                {isLoading && (
                    <div className="space-y-4" aria-busy="true" aria-label="Wird geladen">
                        <SheetTitle className="sr-only">Container wird geladen</SheetTitle>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-40 w-full rounded-xl" />
                    </div>
                )}
                {container && (
                    <>
                        <SheetHeader>
                            <div className="flex flex-wrap items-center gap-2 pr-6">
                                <SheetTitle>{container.name}</SheetTitle>
                                <ContainerStatusBadge status={container.status} />
                            </div>
                            <SheetDescription className="flex items-center gap-1.5 font-mono text-xs">
                                <span className="truncate">{container.image}</span>
                                <CopyButton value={container.image} />
                            </SheetDescription>
                        </SheetHeader>

                        <DetailList
                            className="mt-2"
                            items={[
                                { label: "Host", value: host?.name ?? container.hostId },
                                { label: "Uptime", value: formatUptime(container.uptimeSeconds) },
                                { label: "Health", value: <HealthBadge status={container.healthStatus} /> },
                                { label: "Neustarts", value: <span className="tabular-nums">{container.restartCount}</span> },
                            ]}
                        />

                        <Separator className="my-2" />

                        <Tabs defaultValue="metrics">
                            <TabsList className="w-full justify-start overflow-x-auto">
                                <TabsTrigger value="metrics">Metriken</TabsTrigger>
                                <TabsTrigger value="health">Health</TabsTrigger>
                                <TabsTrigger value="logs">Logs</TabsTrigger>
                                <TabsTrigger value="config">Konfiguration</TabsTrigger>
                            </TabsList>

                            <TabsContent value="metrics" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">CPU</span>
                                            <span className="font-medium tabular-nums">{container.cpuUsagePercent.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %</span>
                                        </div>
                                        <Progress value={container.cpuUsagePercent} className="h-1.5" aria-label="CPU-Auslastung" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">RAM</span>
                                            <span className="font-medium tabular-nums">
                                                {container.memoryUsedMb} / {container.memoryLimitMb} MB
                                            </span>
                                        </div>
                                        <Progress value={(container.memoryUsedMb / container.memoryLimitMb) * 100} className="h-1.5" aria-label="RAM-Auslastung" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">CPU-Verlauf</p>
                                    <MetricChart data={container.cpuHistory} unit="%" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">RAM-Verlauf</p>
                                    <MetricChart data={container.memoryHistory} unit="%" />
                                </div>

                                <DetailList
                                    items={[
                                        { label: "Netzwerk ein", value: <span className="tabular-nums">{container.networkInMbps.toLocaleString("de-DE", { maximumFractionDigits: 1 })} Mbit/s</span> },
                                        { label: "Netzwerk aus", value: <span className="tabular-nums">{container.networkOutMbps.toLocaleString("de-DE", { maximumFractionDigits: 1 })} Mbit/s</span> },
                                    ]}
                                />
                            </TabsContent>

                            <TabsContent value="health" className="space-y-4 pt-4">
                                <div>
                                    <p className="mb-2 text-sm font-semibold">Healthchecks</p>
                                    <ul className="space-y-2">
                                        {container.healthCheckHistory.map((check, i) => (
                                            <li key={i} className="flex items-start justify-between gap-3 border-b pb-2 text-sm last:border-0">
                                                <div className="min-w-0 space-y-1">
                                                    <HealthBadge status={check.status} />
                                                    <p className="text-xs text-muted-foreground">{check.message}</p>
                                                </div>
                                                <TimeCell iso={check.timestamp} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                                        <RotateCcw className="size-3.5" aria-hidden />
                                        Neustarts
                                    </p>
                                    {container.restartHistory.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Keine Neustarts aufgezeichnet.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {container.restartHistory.map((event, i) => (
                                                <li key={i} className="flex items-start justify-between gap-3 border-b pb-2 text-sm last:border-0">
                                                    <span>{event.reason}</span>
                                                    <TimeCell iso={event.timestamp} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="logs" className="pt-4">
                                <div className="max-h-96 space-y-1.5 overflow-y-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs" role="log" aria-label="Container-Logs">
                                    {container.logs.map((line, i) => (
                                        <div key={i} className="flex gap-2">
                                            <span className="text-muted-foreground shrink-0">
                                                {new Date(line.timestamp).toLocaleTimeString("de-DE")}
                                            </span>
                                            <span
                                                className={cn(
                                                    "break-all",
                                                    line.level === "error" ? "text-destructive" : line.level === "warn" ? "text-warning" : "text-foreground",
                                                )}
                                            >
                                                {line.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="config" className="space-y-4 pt-4 text-sm">
                                <div>
                                    <p className="mb-1.5 font-semibold">Rolle in der Topologie</p>
                                    <Select
                                        value={container.nodeRole ?? "unset"}
                                        onValueChange={(value) =>
                                            updateNodeRole.mutate(
                                                {
                                                    containerId: container.id,
                                                    nodeRole: value === "unset" ? null : value,
                                                },
                                                {
                                                    onSuccess: () => toast.success("Rolle gespeichert"),
                                                    onError: (error) => toast.error(getApiErrorMessage(error)),
                                                },
                                            )
                                        }
                                        disabled={updateNodeRole.isPending}
                                    >
                                        <SelectTrigger className="w-56" aria-label="Rolle in der Topologie">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unset">Standard (Container)</SelectItem>
                                            <SelectItem value="reverse-proxy">Reverse proxy</SelectItem>
                                            <SelectItem value="database">Datenbank</SelectItem>
                                            <SelectItem value="application">Anwendung</SelectItem>
                                            <SelectItem value="storage">Speicher</SelectItem>
                                            <SelectItem value="monitoring">Monitoring</SelectItem>
                                            <SelectItem value="dns">DNS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        Als „Reverse proxy“ markiert, zeichnet die Topologie eine Route zu jedem
                                        Container mit Traefik-Labels.
                                    </p>
                                </div>
                                {container.networks.length > 0 && (
                                    <div>
                                        <p className="mb-1.5 font-semibold">Netzwerke</p>
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
                                    <p className="mb-1.5 font-semibold">Ports</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {container.ports.map((port) => (
                                            <span key={port} className="rounded-md bg-muted px-2 py-1 text-xs font-mono">{port}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-1.5 font-semibold">Volumes</p>
                                    <div className="flex flex-col gap-1">
                                        {container.volumes.map((volume) => (
                                            <span key={volume} className="text-xs font-mono text-muted-foreground">{volume}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-1.5 font-semibold">Umgebungsvariablen</p>
                                    <div className="flex flex-col gap-1">
                                        {Object.entries(container.environment).map(([key, value]) => (
                                            <div key={key} className="flex justify-between gap-4 text-xs font-mono">
                                                <span className="text-muted-foreground">{key}</span>
                                                <span className="break-all text-right">{value}</span>
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
