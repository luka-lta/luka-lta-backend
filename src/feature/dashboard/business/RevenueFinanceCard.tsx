import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart.tsx";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge.tsx";
import { chartColor } from "@/feature/dashboard/chartColor.ts";
import { monthlyRevenue, openInvoices } from "@/feature/dashboard/business/demoData.ts";

const chartConfig: ChartConfig = {
    clientProjects: { label: "Kundenprojekte", color: chartColor[0] },
    appStore: { label: "App Store", color: chartColor[6] },
    trackspire: { label: "Trackspire", color: chartColor[2] },
};

function formatEuro(value: number): string {
    return `${value.toLocaleString("de-DE")} €`;
}

function formatDueDate(dueDate: string): string {
    return new Date(dueDate).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export function RevenueFinanceCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue & Finance</CardTitle>
                <CardDescription>Umsatz nach Quelle, letzte 6 Monate (Demo-Daten)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                    <BarChart accessibilityLayer data={monthlyRevenue}>
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
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="clientProjects" stackId="a" fill={chartColor[0]} />
                        <Bar dataKey="appStore" stackId="a" fill={chartColor[6]} />
                        <Bar dataKey="trackspire" stackId="a" fill={chartColor[2]} radius={4} />
                    </BarChart>
                </ChartContainer>

                <div>
                    <h3 className="text-sm font-medium mb-2">Offene Rechnungen</h3>
                    <ul className="space-y-2">
                        {openInvoices.map((invoice) => (
                            <li key={invoice.id} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{invoice.client}</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">fällig {formatDueDate(invoice.dueDate)}</Badge>
                                    <span className="font-medium tabular-nums">{formatEuro(invoice.amount)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
