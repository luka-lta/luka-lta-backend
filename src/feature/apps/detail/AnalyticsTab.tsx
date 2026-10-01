import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useAppAnalytics } from "@/api/apps/hooks";
import type { AppEntity } from "@/api/apps/schema";
import { NoAnalyticsState } from "@/feature/apps/detail/NoAnalyticsState";
import { ANALYTICS_SOURCE_TYPE_LABELS } from "@/feature/apps/labels";
import { cn } from "@/lib/utils";

interface AnalyticsTabProps {
    app: AppEntity;
    onConfigureSource: () => void;
}

const ANALYTICS_CHART_COLOR = "#2980B9";

const chartConfig: ChartConfig = {
    value: { label: "Wert", color: ANALYTICS_CHART_COLOR },
};

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

    const pillBar = (
        <div className="flex flex-wrap gap-2">
            {enabledSources.map((source) => (
                <button
                    key={source.id}
                    type="button"
                    onClick={() => setSelectedSourceId(source.id)}
                    className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-pressed={source.id === activeSourceId}
                >
                    <Badge
                        variant={source.id === activeSourceId ? "default" : "outline"}
                        className={cn("cursor-pointer", source.id === activeSourceId && "ring-2 ring-primary/30")}
                    >
                        {ANALYTICS_SOURCE_TYPE_LABELS[source.type]}
                    </Badge>
                </button>
            ))}
        </div>
    );

    if (analytics.isLoading) {
        return (
            <div className="space-y-4">
                {pillBar}
                <Skeleton className="h-72 w-full rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (analytics.isError) {
        return (
            <div className="space-y-4">
                {pillBar}
                <Alert variant="destructive">
                    <AlertTitle>Analytics konnten nicht geladen werden</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{analytics.error.message}</span>
                        <Button variant="outline" size="sm" onClick={() => analytics.refetch()}>
                            Erneut versuchen
                        </Button>
                    </AlertDescription>
                </Alert>
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

    return (
        <div className="space-y-4">
            {pillBar}
            <Card>
                <CardHeader>
                    <CardTitle>{primaryMetric.label}</CardTitle>
                    <CardDescription>Letzte 30 Tage (Demo-Daten)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                        <LineChart accessibilityLayer data={primaryMetric.series}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value: string) => value.slice(5)}
                            />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                dataKey="value"
                                type="monotone"
                                stroke={ANALYTICS_CHART_COLOR}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">{kpi.label}</p>
                            <p className="text-2xl font-bold tabular-nums mt-1">
                                {formatKpiValue(kpi.value, kpi.unit)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {breakdown && breakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Aufschlüsselung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {breakdown.map((entry) => (
                                <li key={entry.label} className="flex items-center justify-between text-sm">
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
