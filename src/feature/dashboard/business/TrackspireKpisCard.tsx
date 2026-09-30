import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart.tsx";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { chartColor } from "@/feature/dashboard/chartColor.ts";
import { trackspireMonthlyMrr } from "@/feature/dashboard/business/demoData.ts";
import { useAppList } from "@/api/apps/hooks.ts";

const chartConfig: ChartConfig = {
    mrr: { label: "MRR", color: chartColor[2] },
};

function monthlyMrrGrowthPercent(): number | undefined {
    if (trackspireMonthlyMrr.length < 2) return undefined;
    const current = trackspireMonthlyMrr[trackspireMonthlyMrr.length - 1].mrr;
    const previous = trackspireMonthlyMrr[trackspireMonthlyMrr.length - 2].mrr;
    if (previous === 0) return undefined;
    return Math.round(((current - previous) / previous) * 100);
}

export function TrackspireKpisCard() {
    const appList = useAppList();
    const trackspireApp = appList.data?.find((app) => app.category === "saas" && app.name === "Trackspire");
    const growthPercent = monthlyMrrGrowthPercent();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trackspire</CardTitle>
                <CardDescription>SaaS-KPIs (Demo-Zeitreihe für den Chart)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold tabular-nums">
                            {(trackspireApp?.metrics?.mrr ?? 0).toLocaleString("de-DE")} €
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            MRR{growthPercent !== undefined ? ` (${growthPercent >= 0 ? "+" : ""}${growthPercent}%)` : ""}
                        </p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{trackspireApp?.metrics?.activeUsers ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Aktive User</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold tabular-nums">{trackspireApp?.metrics?.churnPercent ?? 0}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Churn</p>
                    </div>
                </div>

                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart accessibilityLayer data={trackspireMonthlyMrr}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}€`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            dataKey="mrr"
                            type="monotone"
                            stroke={chartColor[2]}
                            strokeWidth={2}
                            dot={{ r: 4, fill: chartColor[2] }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
