"use client"

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface ClickData {
    displayname: string
    click_date: string
    total_clicks: number
}

interface ClicksListProps {
    clicks: ClickData[]
    loading: boolean
    setFilterData: (filterData: Record<string, string>) => void
}

function AnalyticsItem({ clicks, loading }: ClicksListProps) {
    const [timeRange, setTimeRange] = useState("30d")

    // Filter data based on selected time range
    const filteredData = useMemo(() => {
        if (!clicks.length) return []

        const referenceDate = new Date()
        let daysToSubtract = 90
        if (timeRange === "30d") daysToSubtract = 30
        else if (timeRange === "7d") daysToSubtract = 7

        const startDate = new Date()
        startDate.setDate(referenceDate.getDate() - daysToSubtract)

        return clicks.filter((item) => new Date(item.click_date) >= startDate)
    }, [clicks, timeRange])

    // Get unique display names
    const displayNames = useMemo(() => {
        if (!clicks.length) return []
        return [...new Set(clicks.map((click) => click.displayname))]
    }, [clicks])

    // Transform data for the chart
    const chartData = useMemo(() => {
        if (!filteredData.length) return []

        // Get date range
        const dateRange = new Set<string>()
        const startDate = new Date()
        const endDate = new Date()

        // Determine date range based on timeRange
        let daysToSubtract = 90
        if (timeRange === "30d") daysToSubtract = 30
        else if (timeRange === "7d") daysToSubtract = 7

        startDate.setDate(endDate.getDate() - daysToSubtract)

        // Generate all dates in the range
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split("T")[0]
            dateRange.add(dateStr)
            currentDate.setDate(currentDate.getDate() + 1)
        }

        // Group by date
        const groupedByDate: Record<string, Record<string, number>> = {}

        // Initialize all dates with zero values for all display names
        dateRange.forEach((date) => {
            groupedByDate[date] = {}
            displayNames.forEach((name) => {
                groupedByDate[date][name] = 0
            })
        })

        // Fill in actual data
        filteredData.forEach((click) => {
            if (groupedByDate[click.click_date]) {
                groupedByDate[click.click_date][click.displayname] = click.total_clicks
            }
        })

        // Convert to array format for the chart and sort by date
        return Object.entries(groupedByDate)
            .map(([date, values]) => ({
                date,
                ...values,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [filteredData, timeRange, displayNames])

    // Create chart config dynamically based on display names
    const chartConfig = useMemo(() => {
        const config: Record<string, { label: string; color: string }> = {}

        displayNames.forEach((name, index) => {
            config[name] = {
                label: name,
                color: `hsl(var(--chart-${(index % 12) + 1}))`,
            }
        })

        return config
    }, [displayNames])

    if (loading) {
        return (
            <Card>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex items-center justify-center h-[300px]">
                        <p>Loading analytics data...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!clicks.length) {
        return (
            <Card>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex items-center justify-center h-[300px]">
                        <p>No click data available</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1 text-center sm:text-left">
                        <CardTitle>Click Events</CardTitle>
                        <CardDescription>Showing the total Referral Click Events</CardDescription>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d">Last 3 months</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <AreaChart data={chartData}>
                        <defs>
                            {displayNames.map((name, index) => (
                                <linearGradient key={name} id={`fill-${name}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={`hsl(var(--chart-${(index % 12) + 1}))`} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={`hsl(var(--chart-${(index % 12) + 1}))`} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={true}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }
                        />
                        <YAxis axisLine={false} tickLine={false} tickMargin={8} domain={[0, "auto"]} />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                    indicator="line"
                                />
                            }
                        />
                        {displayNames.map((name, index) => (
                            <Area
                                key={name}
                                dataKey={name}
                                type="linear"
                                fill={`url(#fill-${name})`}
                                stroke={`hsl(var(--chart-${(index % 12) + 1}))`}
                                strokeWidth={2}
                                stackId="a"
                                connectNulls={true}
                            />
                        ))}
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default AnalyticsItem

