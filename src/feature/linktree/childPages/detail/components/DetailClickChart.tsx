import {useState} from 'react';
import {Card, CardContent} from "@/components/ui/card.tsx";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart.tsx";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";

const chartConfig = {
    click: {
        label: "Click",
        color: "hsl(var(--chart-1))",
    }
} satisfies ChartConfig

const chartData = [
    { date: "2024-04-01", click: 372 },
    { date: "2024-04-02", click: 277 },
    { date: "2024-04-03", click: 287 },
    { date: "2024-04-04", click: 502 },
    { date: "2024-04-05", click: 686 },
    { date: "2024-04-06", click: 664 },
    { date: "2024-04-07", click: 448 },
    { date: "2024-04-08", click: 963 },
    { date: "2024-04-09", click: 169 },
    { date: "2024-04-10", click: 451 },
    { date: "2024-04-11", click: 677 },
    { date: "2024-04-12", click: 502 },
    { date: "2024-04-13", click: 722 },
    { date: "2024-04-14", click: 357 },
    { date: "2024-04-15", click: 290 },
    { date: "2024-04-16", click: 328 },
    { date: "2024-04-17", click: 806 },
    { date: "2024-04-18", click: 774 },
    { date: "2024-04-19", click: 245 },
    { date: "2024-04-20", click: 91 },
    { date: "2024-04-21", click: 139 },
    { date: "2024-04-22", click: 226 },
    { date: "2024-04-23", click: 140 },
    { date: "2024-04-24", click: 389 },
    { date: "2024-04-25", click: 217 },
    { date: "2024-04-26", click: 205 },
    { date: "2024-04-27", click: 803 },
    { date: "2024-04-28", click: 302 },
    { date: "2024-04-29", click: 555 },
    { date: "2024-04-30", click: 834 },
    { date: "2024-05-01", click: 385 },
    { date: "2024-05-02", click: 603 },
    { date: "2024-05-03", click: 437 },
    { date: "2024-05-04", click: 805 },
    { date: "2024-05-05", click: 871 },
    { date: "2024-05-06", click: 1018 },
    { date: "2024-05-07", click: 688 },
    { date: "2024-05-08", click: 359 },
    { date: "2024-05-09", click: 407 },
    { date: "2024-05-10", click: 623 },
    { date: "2024-05-11", click: 605 },
    { date: "2024-05-12", click: 437 },
    { date: "2024-05-13", click: 357 },
    { date: "2024-05-14", click: 938 },
    { date: "2024-05-15", click: 853 },
    { date: "2024-05-16", click: 738 },
    { date: "2024-05-17", click: 919 },
    { date: "2024-05-18", click: 665 },
    { date: "2024-05-19", click: 415 },
    { date: "2024-05-20", click: 407 },
    { date: "2024-05-21", click: 222 },
    { date: "2024-05-22", click: 201 },
    { date: "2024-05-23", click: 542 },
    { date: "2024-05-24", click: 514 },
    { date: "2024-05-25", click: 451 },
    { date: "2024-05-26", click: 383 },
    { date: "2024-05-27", click: 880 },
    { date: "2024-05-28", click: 423 },
    { date: "2024-05-29", click: 208 },
    { date: "2024-05-30", click: 620 },
    { date: "2024-05-31", click: 408 },
    { date: "2024-06-01", click: 378 },
    { date: "2024-06-02", click: 880 },
    { date: "2024-06-03", click: 263 },
    { date: "2024-06-04", click: 819 },
    { date: "2024-06-05", click: 228 },
    { date: "2024-06-06", click: 544 },
    { date: "2024-06-07", click: 693 },
    { date: "2024-06-08", click: 705 },
    { date: "2024-06-09", click: 918 },
    { date: "2024-06-10", click: 355 },
    { date: "2024-06-11", click: 242 },
    { date: "2024-06-12", click: 912 },
    { date: "2024-06-13", click: 211 },
    { date: "2024-06-14", click: 806 },
    { date: "2024-06-15", click: 657 },
    { date: "2024-06-16", click: 681 },
    { date: "2024-06-17", click: 995 },
    { date: "2024-06-18", click: 277 },
    { date: "2024-06-19", click: 631 },
    { date: "2024-06-20", click: 858 },
    { date: "2024-06-21", click: 383 },
    { date: "2024-06-22", click: 591 },
    { date: "2024-06-23", click: 1014 },
    { date: "2024-06-24", click: 316 },
    { date: "2024-06-25", click: 754 },
    { date: "2024-06-26", click: 814 }
];


function DetailClickChart() {
    const [timeRange] = useState("7d")

    const filteredData = chartData.filter((item) => {
        const date = new Date(item.date)
        const referenceDate = new Date("2024-06-30")
        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }
        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)
        return date >= startDate
    })

    return (
        <Card>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillReferral1" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-click)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-click)"
                                    stopOpacity={0.0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="date"
                            tickLine={true}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="line"
                                />
                            }
                        />
                        <Area
                            dataKey="click"
                            type="bump"
                            fill="url(#fillReferral1)"
                            stroke="var(--color-click)"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default DetailClickChart;