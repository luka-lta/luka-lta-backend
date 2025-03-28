"use client"

import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { RefreshButton } from "@/components/button/RefreshButton"
import type { ClicksMonthlyTypeSchema } from "@/feature/dashboard/schema/ClickSummarySchema"
import {chartColor} from "@/feature/dashboard/chartColor.ts";

interface ClicksChartProps {
    clicksMonthly: ClicksMonthlyTypeSchema[] | string
}

function ClicksChart({ clicksMonthly }: ClicksChartProps) {
    const queryClient = useQueryClient()

    if (typeof clicksMonthly === "string") {
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

    const uniqueMonths = Array.from(new Set(clicksMonthly.map((item) => item.month)))
    const uniqueDisplayNames = Array.from(new Set(clicksMonthly.map((item) => item.displayname)))

    const chartData = uniqueMonths.map((monthStr) => {
        const [year, month] = monthStr.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
        const monthName = date.toLocaleString("default", { month: "long" })

        const monthData: Record<string, string|number> = { month: monthName }

        uniqueDisplayNames.forEach((name) => {
            const entry = clicksMonthly.find((item) => item.month === monthStr && item.displayname === name)
            monthData[name] = entry ? entry.total_clicks : 0
        })

        return monthData
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
                <h2 className="text-sm font-semibold text-gray-500">Clicks overview</h2>
                <Button variant="secondary" className="flex items-center justify-center p-3">
                    <RefreshButton onRefresh={() => queryClient.invalidateQueries({ queryKey: ["summary", "click", "list"] })} />
                </Button>
            </div>

            {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={true}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />

                        {/* Dynamically render stacked bars for each displayname */}
                        {uniqueDisplayNames.map((name, index) => (
                            <Bar
                                key={name}
                                dataKey={name}
                                stackId="a" // This makes the bars stack on top of each other
                                fill={colorMap[name]} // Use direct color value instead of CSS variable
                                radius={index === uniqueDisplayNames.length - 1 ? 4 : 0} // Only round the top of the stack
                            />
                        ))}
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="flex items-center justify-center h-[200px] w-full">
                    <p className="text-gray-500">No click data available</p>
                </div>
            )}
        </div>
    )
}

export default ClicksChart

