import { useState } from "react";
import { LineChart as LineChartIcon, Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatGrid } from "@/components/data/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useAppAnalytics } from "@/api/apps/hooks";
import type { AppEntity } from "@/api/apps/schema";
import { ANALYTICS_SOURCE_TYPE_LABELS } from "@/feature/apps/labels";

interface AnalyticsTabProps {
    app: AppEntity;
    onConfigureSource: () => void;
}

const chartConfig: ChartConfig = {
    value: { label: "Wert", color: "hsl(var(--chart-1))" },
};

function NoAnalyticsState({ onConfigure }: { onConfigure: () => void }) {
    return (
        <EmptyState
            icon={LineChartIcon}
            title="Keine Analytics-Quelle verbunden"
            description="Verbinde App Store Connect, Firebase oder eine eigene Quelle, um hier Analytics zu sehen."
            action={
                <Button variant="outline" size="sm" onClick={onConfigure}>
                    <Settings2 />
                    Quelle konfigurieren
                </Button>
            }
        />
    );
}

function formatKpiValue(value: number, unit?: string): string {
    const formatted = value.toLocaleString("de-DE");
    return unit ? `${formatted}${unit === "%" || unit === "ms" ? unit : ` ${unit}`}` : formatted;
}

export function AnalyticsTab({ app, onConfigureSource }: AnalyticsTabProps) {
    const enabledSources = app.analyticsSources.filter((s) => s.enabled);
    const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>(enabledSources[0]?.id);
    const activeSourceId = enabledSources.some((s) => s.id === selectedSourceId) ? selectedSourceId : enabledSources[0]?.id;
    const analytics = useAppAnalytics(app, activeSourceId);

    if (enabledSources.length === 0) {
        return <NoAnalyticsState onConfigure={onConfigureSource} />;
    }

    const pillBar = enabledSources.length > 1 ? (
        <div role="group" aria-label="Analytics-Quelle" className="inline-flex flex-wrap gap-1 rounded-lg border bg-card p-1 shadow-xs">
            {enabledSources.map((source) => {
                const active = source.id === activeSourceId;
                return (
                    <Button
                        key={source.id}
                        type="button"
                        size="sm"
                        variant={active ? "secondary" : "ghost"}
                        className="h-7"
                        aria-pressed={active}
                        onClick={() => setSelectedSourceId(source.id)}
                    >
                        {ANALYTICS_SOURCE_TYPE_LABELS[source.type]}
                    </Button>
                );
            })}
        </div>
    ) : null;

    if (analytics.isLoading) {
        return (
            <div className="space-y-4" aria-busy="true" aria-label="Wird geladen">
                {pillBar}
                <Skeleton className="h-80 w-full rounded-xl" />
                <div className="grid gap-4 sm:grid-cols-3">
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                </div>
            </div>
        );
    }

    if (analytics.isError) {
        return (
            <div className="space-y-4">
                {pillBar}
                <ErrorState title="Analytics konnten nicht geladen werden" error={analytics.error} onRetry={() => analytics.refetch()} />
            </div>
        );
    }

    if (!analytics.data) {
        return (
            <div className="space-y-4">
                {pillBar}
                <NoAnalyticsState onConfigure={onConfigureSource} />
            </div>
        );
    }

    const { primaryMetric, kpis, breakdown } = analytics.data;
    const sourceLabel = ANALYTICS_SOURCE_TYPE_LABELS[enabledSources.find((s) => s.id === activeSourceId)?.type ?? enabledSources[0].type];

    return (
        <div className="space-y-4">
            {pillBar}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                    <div className="space-y-1">
                        <CardTitle>{primaryMetric.label}</CardTitle>
                        <CardDescription>Letzte 30 Tage · {sourceLabel}</CardDescription>
                    </div>
                    <Badge variant="warning">Demo</Badge>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                        <LineChart accessibilityLayer data={primaryMetric.series} margin={{ left: 4, right: 8 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                minTickGap={24}
                                tickFormatter={(value: string) => `${value.slice(8, 10)}.${value.slice(5, 7)}.`}
                            />
                            <YAxis width={44} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => v.toLocaleString("de-DE")} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <StatGrid className="lg:grid-cols-3">
                {kpis.map((kpi) => (
                    <StatCard key={kpi.label} label={kpi.label} value={formatKpiValue(kpi.value, kpi.unit)} demo />
                ))}
            </StatGrid>

            {breakdown && breakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Aufschlüsselung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y text-sm">
                            {breakdown.map((entry) => (
                                <li key={entry.label} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                                    <span className="text-muted-foreground">{entry.label}</span>
                                    <span className="font-medium tabular-nums">{entry.value.toLocaleString("de-DE")}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
