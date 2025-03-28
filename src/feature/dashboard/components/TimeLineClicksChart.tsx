"use client"

import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { RefreshButton } from "@/components/button/RefreshButton"
import type { ClicksDailyTypeSchema } from "@/feature/dashboard/schema/ClickSummarySchema"
import {chartColor} from "@/feature/dashboard/chartColor.ts";

interface TimeLineClicksChartProps {
    clicksDaily: ClicksDailyTypeSchema[] | string
}

const TimeLineClicksChart: React.FC<TimeLineClicksChartProps> = ({ clicksDaily }) => {
    const queryClient = useQueryClient()

    if (typeof clicksDaily === "string") {
        return (
            <div className="p-6">
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-semibold">Clicks Overview</h1>
                        <RefreshButton
                            onRefresh={() => queryClient.invalidateQueries({ queryKey: ["summary", "click", "list"] })}
                        />
                    </div>
                    <div className="text-gray-500">No data available</div>
                </div>
            </div>
        )
    }

    // Get unique dates and displaynames
    const uniqueDates = Array.from(new Set(clicksDaily.map((item) => item.date)))
    const uniqueDisplayNames = Array.from(new Set(clicksDaily.map((item) => item.displayname)))

    // Generate chart data with total clicks per date for each displayname
    const chartData = uniqueDates.map((date) => {
        const dateData: Record<string, string | number> = { date }

        uniqueDisplayNames.forEach((name) => {
            const entry = clicksDaily.find(
                (item) => item.date === date && item.displayname === name
            )
            dateData[name] = entry ? entry.total_clicks : 0
        })

        return dateData
    })

    const colorMap: Record<string, string> = {}
    uniqueDisplayNames.forEach((name, index) => {
        colorMap[name] = chartColor[index % chartColor.length]
    })

    const chartConfig: ChartConfig = {}
    uniqueDisplayNames.forEach((name, index) => {
        chartConfig[name] = {
            label: name,
            color: chartColor[index % chartColor.length],
        }
    })

    return (
        <div className="flex h-full w-full flex-col p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-500">Clicks over time</h2>
                <Button variant="secondary" className="flex items-center justify-center p-3">
                    <RefreshButton
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["summary", "click", "list"] })}
                    />
                </Button>
            </div>

            {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={true}
                            tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { weekday: "short" })}
                        />
                        <YAxis tickLine={false} axisLine={true} tickFormatter={(value) => `${value}`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />

                        {uniqueDisplayNames.map((name) => (
                            <Line
                                key={name}
                                type="monotone"
                                dataKey={name}
                                stroke={colorMap[name]}
                                strokeWidth={2}
                                dot={{ fill: colorMap[name], strokeWidth: 2 }}
                                activeDot={{ r: 8 }}
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-[200px] w-full">
                    <p className="text-gray-500">No click data available</p>
                </div>
            )}
        </div>
    )
}

export default TimeLineClicksChart
