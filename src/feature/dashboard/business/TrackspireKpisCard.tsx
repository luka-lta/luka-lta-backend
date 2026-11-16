import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { trackspireMonthlyMrr } from "@/feature/dashboard/business/demoData.ts";
import { useAppList } from "@/api/apps/hooks.ts";
import { cn } from "@/lib/utils.ts";

const chartConfig: ChartConfig = {
    mrr: { label: "MRR", color: "hsl(var(--chart-3))" },
};

function monthlyMrrGrowthPercent(): number | undefined {
    if (trackspireMonthlyMrr.length < 2) return undefined;
    const current = trackspireMonthlyMrr[trackspireMonthlyMrr.length - 1].mrr;
    const previous = trackspireMonthlyMrr[trackspireMonthlyMrr.length - 2].mrr;
    if (previous === 0) return undefined;
    return Math.round(((current - previous) / previous) * 100);
}

function Metric({ label, value, hint, hintTone }: { label: string; value: string; hint?: string; hintTone?: "up" | "down" }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-xl font-semibold tabular-nums">{value}</dd>
            {hint && (
                <dd className={cn("text-xs", hintTone === "up" ? "text-success" : hintTone === "down" ? "text-destructive" : "text-muted-foreground")}>
                    {hint}
                </dd>
            )}
        </div>
    );
}

export function TrackspireKpisCard() {
    const appList = useAppList();
    const trackspireApp = appList.data?.find((app) => app.category === "saas");
    const growth = monthlyMrrGrowthPercent();

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="space-y-1">
                    <CardTitle>Trackspire</CardTitle>
                    <CardDescription>SaaS-Kennzahlen und MRR-Verlauf</CardDescription>
                </div>
                <Badge variant="warning">Demo</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
                {appList.isPending ? (
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                    </div>
                ) : appList.isError ? (
                    <ErrorState variant="plain" className="py-4" title="Kennzahlen konnten nicht geladen werden" error={appList.error} onRetry={() => appList.refetch()} />
                ) : (
                    <dl className="grid grid-cols-3 gap-4">
                        <Metric
                            label="MRR"
                            value={`${(trackspireApp?.metrics?.mrr ?? 0).toLocaleString("de-DE")} €`}
                            hint={growth !== undefined ? `${growth >= 0 ? "+" : ""}${growth} % zum Vormonat` : undefined}
                            hintTone={growth === undefined ? undefined : growth >= 0 ? "up" : "down"}
                        />
                        <Metric label="Aktive Nutzer" value={(trackspireApp?.metrics?.activeUsers ?? 0).toLocaleString("de-DE")} />
                        <Metric label="Churn" value={`${(trackspireApp?.metrics?.churnPercent ?? 0).toLocaleString("de-DE")} %`} />
                    </dl>
                )}

                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart accessibilityLayer data={trackspireMonthlyMrr} margin={{ left: 4, right: 8 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis width={52} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value.toLocaleString("de-DE")} €`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line dataKey="mrr" type="monotone" stroke="var(--color-mrr)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-mrr)" }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
