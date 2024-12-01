import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart.tsx";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";

export default function DashboardPage() {
    const chartData = [
        {month: "January", clicks: 186, links: 80},
        {month: "February", clicks: 305, links: 200},
        {month: "March", clicks: 237, links: 120},
        {month: "April", clicks: 73, links: 190},
        {month: "May", clicks: 209, links: 130},
        {month: "June", clicks: 214, links: 140},
    ]

    const chartConfig = {
        clicks: {
            label: "Clicks",
            color: "#c725eb",
        },
        links: {
            label: "Links",
            color: "#3e2185",
        },
    } satisfies ChartConfig

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50"/>
                <div className="aspect-video rounded-xl bg-muted/50">
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
                            <Bar dataKey="links" fill="var(--color-links)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50"/>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"/>
        </div>
    );
}