"use client"

import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts"
import {useQueryClient} from "@tanstack/react-query"
import {RefreshButton} from "@/components/refresh-button.tsx"
import type {ClicksMonthlyTypeSchema} from "@/feature/dashboard/schema/ClickSummarySchema"
import {chartColor} from "@/feature/dashboard/chartColor.ts"
import {useEffect, useState} from "react"

interface ClicksChartProps {
    clicksMonthly: ClicksMonthlyTypeSchema[] | string
}

function ClicksChart({clicksMonthly}: ClicksChartProps) {
    const queryClient = useQueryClient()
    const [last5Months, setLast5Months] = useState<string[]>([])

    useEffect(() => {
        // Generate last 5 months including current month
        const months = []
        const date = new Date()

        for (let i = 4; i >= 0; i--) {
            const tempDate = new Date(date)
            tempDate.setMonth(date.getMonth() - i)
            const year = tempDate.getFullYear()
            const month = (tempDate.getMonth() + 1).toString().padStart(2, '0')
            months.push(`${year}-${month}`)
        }

        setLast5Months(months)
    }, [])

    if (typeof clicksMonthly === "string") {
        return (
            <div className="p-6">
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-semibold">Clicks Overview</h1>
                        <RefreshButton
                            onRefresh={() => queryClient.invalidateQueries({queryKey: ["summary", "click", "list"]})}
                        />
                    </div>
                    <div className="text-gray-500">No data available</div>
                </div>
            </div>
        )
    }

    const uniqueDisplayNames = Array.from(new Set(clicksMonthly.map((item) => item.displayname)))

    const chartData = last5Months.map((monthStr) => {
        const [year, month] = monthStr.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
        const monthName = date.toLocaleString("default", {month: "short"})

        const monthData: Record<string, string | number> = {month: monthName}

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
                <h2 className="text-sm font-semibold text-gray-500">Clicks overview (last 5 months)</h2>
                <RefreshButton
                    onRefresh={() => queryClient.invalidateQueries({queryKey: ["summary", "click", "list"]})}/>
            </div>

            {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={true}
                        />
                        <ChartTooltip content={<ChartTooltipContent/>}/>
                        <ChartLegend content={<ChartLegendContent/>}/>

                        {uniqueDisplayNames.map((name, index) => (
                            <Bar
                                key={name}
                                dataKey={name}
                                stackId="a"
                                fill={colorMap[name]}
                                radius={index === uniqueDisplayNames.length - 1 ? 4 : 0}
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