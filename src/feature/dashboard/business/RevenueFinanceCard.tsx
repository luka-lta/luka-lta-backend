import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
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
import { monthlyRevenue, openInvoices } from "@/feature/dashboard/business/demoData.ts";
import { DateTime } from "luxon";

const chartConfig: ChartConfig = {
    clientProjects: { label: "Kundenprojekte", color: "hsl(var(--chart-1))" },
    appStore: { label: "App Store", color: "hsl(var(--chart-2))" },
    trackspire: { label: "Trackspire", color: "hsl(var(--chart-3))" },
};

const euro = (value: number) => `${value.toLocaleString("de-DE")} €`;

function dueLabel(dueDate: string): { text: string; overdue: boolean } {
    const due = DateTime.fromISO(dueDate).startOf("day");
    const days = Math.round(due.diff(DateTime.now().startOf("day"), "days").days);
    if (days < 0) return { text: `${Math.abs(days)} T überfällig`, overdue: true };
    if (days === 0) return { text: "heute fällig", overdue: false };
    return { text: `fällig ${due.toFormat("dd.MM.")}`, overdue: false };
}

export function RevenueFinanceCard() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="space-y-1">
                    <CardTitle>Umsatz nach Quelle</CardTitle>
                    <CardDescription>Letzte 6 Monate</CardDescription>
                </div>
                <Badge variant="warning">Demo</Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                    <BarChart accessibilityLayer data={monthlyRevenue} margin={{ left: 4 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis width={52} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => euro(value)} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="clientProjects" stackId="a" fill="var(--color-clientProjects)" />
                        <Bar dataKey="appStore" stackId="a" fill="var(--color-appStore)" />
                        <Bar dataKey="trackspire" stackId="a" fill="var(--color-trackspire)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>

                <section aria-labelledby="open-invoices" className="space-y-3 lg:border-l lg:pl-6">
                    <h3 id="open-invoices" className="text-sm font-semibold">Offene Rechnungen</h3>
                    {openInvoices.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Keine offenen Rechnungen.</p>
                    ) : (
                        <ul className="divide-y text-sm">
                            {openInvoices.map((invoice) => {
                                const due = dueLabel(invoice.dueDate);
                                return (
                                    <li key={invoice.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{invoice.client}</p>
                                            <p className={due.overdue ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{due.text}</p>
                                        </div>
                                        <span className="font-semibold tabular-nums">{euro(invoice.amount)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </CardContent>
        </Card>
    );
}
