"use client"

import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart"
import {LineChart, Line, XAxis, YAxis, CartesianGrid} from "recharts"
import {useQueryClient} from "@tanstack/react-query"
import {RefreshButton} from "@/components/button/RefreshButton"
import type {ClicksDailyTypeSchema} from "@/feature/dashboard/schema/ClickSummarySchema"
import {chartColor} from "@/feature/dashboard/chartColor.ts"
import {useEffect, useState} from "react"

interface TimeLineClicksChartProps {
    clicksDaily: ClicksDailyTypeSchema[] | string
}

const TimeLineClicksChart: React.FC<TimeLineClicksChartProps> = ({clicksDaily}) => {
    const queryClient = useQueryClient()
    const [last6Days, setLast6Days] = useState<string[]>([])

    useEffect(() => {
        // Generate last 6 days including today
        const days = []
        const date = new Date()

        for (let i = 5; i >= 0; i--) {
            const tempDate = new Date(date)
            tempDate.setDate(date.getDate() - i)
            const formattedDate = tempDate.toISOString().split('T')[0] // YYYY-MM-DD format
            days.push(formattedDate)
        }

        setLast6Days(days)
    }, [])

    if (typeof clicksDaily === "string") {
        return (
            <div className="p-6">
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-semibold">Clicks Overview</h1>
                        <RefreshButton
                            onRefresh={() => queryClient.invalidateQueries({queryKey: ['summary', 'click', 'list']})}/>

                    </div>
                    <div className="text-gray-500">No data available</div>
                </div>
            </div>
        )
    }

    const uniqueDisplayNames = Array.from(new Set(clicksDaily.map((item) => item.displayname)))

    // Generate chart data for last 6 days
    const chartData = last6Days.map((date) => {
        const dayData: Record<string, string | number> = {
            date,
            // Format date for display (e.g., "Mon", "Tue")
            day: new Date(date).toLocaleDateString("en-US", {weekday: "short"})
        }

        uniqueDisplayNames.forEach((name) => {
            const entry = clicksDaily.find(
                (item) => item.date === date && item.displayname === name
            )
            dayData[name] = entry ? entry.total_clicks : 0
        })

        return dayData
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
                <h2 className="text-sm font-semibold text-gray-500">Clicks over time (last 6 days)</h2>
                <RefreshButton onRefresh={() => queryClient.invalidateQueries({queryKey: ["summary", "click", "list"]})} />
            </div>

            {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis
                            dataKey="day" // Use the pre-formatted day name
                            tickLine={false}
                            tickMargin={10}
                            axisLine={true}
                        />
                        <YAxis tickLine={false} axisLine={true} tickFormatter={(value) => `${value}`}/>
                        <ChartTooltip
                            content={<ChartTooltipContent/>}
                            labelFormatter={(value) => {
                                const fullDate = chartData.find(item => item.day === value)?.date
                                return fullDate ? new Date(fullDate).toLocaleDateString() : value
                            }}
                        />
                        <ChartLegend content={<ChartLegendContent/>}/>

                        {uniqueDisplayNames.map((name) => (
                            <Line
                                key={name}
                                type="monotone"
                                dataKey={name}
                                stroke={colorMap[name]}
                                strokeWidth={2}
                                dot={{fill: colorMap[name], strokeWidth: 2}}
                                activeDot={{r: 8}}
                                connectNulls={true}
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