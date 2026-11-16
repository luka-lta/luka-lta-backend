import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { useClickSummary } from "@/api/dashboard/hooks.ts";

const chartConfig = {
    clicks: { label: "Klicks", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const RANGES = { '7d': 7, '30d': 30, '90d': 90 } as const;
type Range = keyof typeof RANGES;

/** Tägliche Klicks dieses Links aus der Klick-Zusammenfassung (lückenlos aufgefüllt). */
function DetailClickChart({ displayname }: { displayname: string }) {
    const [range, setRange] = useState<Range>('30d');
    const [summary] = useClickSummary();

    const { data, total } = useMemo(() => {
        const byDate = new Map<string, number>();
        for (const entry of summary.data?.summary.clicksDaily ?? []) {
            if (entry.displayname !== displayname) continue;
            byDate.set(entry.date, (byDate.get(entry.date) ?? 0) + entry.total_clicks);
        }
        const today = DateTime.now().startOf('day');
        const days = Array.from({ length: RANGES[range] }, (_, i) => {
            const date = today.minus({ days: RANGES[range] - 1 - i }).toISODate() ?? '';
            return { date, clicks: byDate.get(date) ?? 0 };
        });
        return { data: days, total: days.reduce((sum, d) => sum + d.clicks, 0) };
    }, [summary.data, displayname, range]);

    const formatDay = (value: string) => DateTime.fromISO(value).setLocale('de').toFormat('d. LLL');

    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                <div className="space-y-1">
                    <CardTitle>Klicks</CardTitle>
                    <CardDescription>
                        {summary.isPending ? 'Wird geladen…' : `${total.toLocaleString('de-DE')} in den letzten ${RANGES[range]} Tagen`}
                    </CardDescription>
                </div>
                <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
                    <TabsList className="h-8">
                        {(Object.keys(RANGES) as Range[]).map((r) => (
                            <TabsTrigger key={r} value={r} className="px-2.5 text-xs">{RANGES[r]} T</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                {summary.isPending ? (
                    <Skeleton className="h-[240px] w-full" />
                ) : summary.isError ? (
                    <ErrorState variant="plain" title="Klicks konnten nicht geladen werden" error={summary.error} onRetry={() => summary.refetch()} />
                ) : total === 0 ? (
                    <EmptyState variant="plain" icon={BarChart3} title="Keine Klicks im Zeitraum" description="Sobald der Link aufgerufen wird, erscheinen die Klicks hier." />
                ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
                        <AreaChart data={data} margin={{ left: 0, right: 8 }}>
                            <defs>
                                <linearGradient id="fillLinkClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatDay} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(v) => formatDay(String(v))} indicator="line" />} />
                            <Area dataKey="clicks" type="monotone" fill="url(#fillLinkClicks)" stroke="var(--color-clicks)" strokeWidth={2} />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}

export default DetailClickChart;
