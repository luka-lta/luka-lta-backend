import {
    ChartConfig, ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart.tsx";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";

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
        color: "#7D3C98", // Sattes Lila
    },
    links: {
        label: "Links",
        color: "#2874A6", // Kräftiges Blau
    },
} satisfies ChartConfig;


function ClicksChart() {
    return (
        <div className="flex h-full w-full flex-col p-4">
            <h2 className="text-sm font-semibold text-gray-500">Clicks overview</h2>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false}/>
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={true}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip content={<ChartTooltipContent/>}/>
                    <ChartLegend content={<ChartLegendContent/>}/>
                    <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4}/>
                    <Bar dataKey="links" fill="var(--color-links)" radius={4}/>
                </BarChart>
            </ChartContainer>
        </div>
    );
}

export default ClicksChart;