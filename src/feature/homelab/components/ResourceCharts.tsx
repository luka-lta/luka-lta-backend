import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { Host } from "@/feature/homelab/types.ts";
import { PageSection } from "@/components/layout/page.tsx";

interface ResourceChartsProps {
    hosts: Host[];
}

const timeTickFormatter = (v: string) => new Date(v).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

function aggregate(hosts: Host[], key: "cpu" | "memory" | "disk" | "networkIn" | "networkOut") {
    const length = Math.max(0, ...hosts.map((h) => h.metrics[key].length));

    return Array.from({ length }, (_, i) => {
        const points = hosts.map((h) => h.metrics[key][i]).filter((point) => point !== undefined);
        const timestamp = points[0]?.timestamp ?? "";
        const avg = points.length > 0 ? points.reduce((sum, p) => sum + p.value, 0) / points.length : 0;
        return { timestamp, value: Number(avg.toFixed(1)) };
    });
}

const usageConfig: ChartConfig = {
    value: { label: "Auslastung", color: "hsl(var(--chart-1))" },
};

const networkConfig: ChartConfig = {
    networkIn: { label: "Ein", color: "hsl(var(--chart-1))" },
    networkOut: { label: "Aus", color: "hsl(var(--chart-2))" },
};

function UsageAreaChart({ data, unit }: { data: { timestamp: string; value: number }[]; unit: string }) {
    return (
        <ChartContainer config={usageConfig} className="h-56 w-full">
            <AreaChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tickFormatter={timeTickFormatter} minTickGap={40} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v} ${unit}`} width={44} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => new Date(v).toLocaleTimeString("de-DE")} formatter={(value) => [`${value} ${unit}`, "Ø"]} />} />
                <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
            </AreaChart>
        </ChartContainer>
    );
}

export function ResourceCharts({ hosts }: ResourceChartsProps) {
    const cpu = aggregate(hosts, "cpu");
    const memory = aggregate(hosts, "memory");
    const disk = aggregate(hosts, "disk");
    const networkIn = aggregate(hosts, "networkIn");
    const networkOut = aggregate(hosts, "networkOut");

    const networkData = networkIn.map((point, i) => ({
        timestamp: point.timestamp,
        networkIn: point.value,
        networkOut: networkOut[i]?.value ?? 0,
    }));

    return (
        <PageSection title="Ressourcen" description="Durchschnitt über alle Hosts, letzte 12 Stunden.">
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">CPU</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UsageAreaChart data={cpu} unit="%" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">RAM</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UsageAreaChart data={memory} unit="%" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Disk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UsageAreaChart data={disk} unit="%" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Netzwerk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={networkConfig} className="h-56 w-full">
                            <LineChart data={networkData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tickFormatter={timeTickFormatter} minTickGap={40} fontSize={11} />
                                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v} Mbit/s`} width={64} />
                                <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => new Date(v).toLocaleTimeString("de-DE")} />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line type="monotone" dataKey="networkIn" stroke="var(--color-networkIn)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="networkOut" stroke="var(--color-networkOut)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </PageSection>
    );
}
