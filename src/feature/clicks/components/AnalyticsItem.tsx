import { BarChart3 } from "lucide-react"
import { EmptyState } from "@/components/feedback/empty-state.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface ClickData {
    displayname: string
    click_date: string
    total_clicks: number
}

interface ClicksListProps {
    clicks: ClickData[]
    loading: boolean
}

const CHART_COLORS = 5
const color = (index: number) => `hsl(var(--chart-${(index % CHART_COLORS) + 1}))`
const formatDay = (value: string) => new Date(value).toLocaleDateString("de-DE", { day: "numeric", month: "short" })

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
                color: color(index),
            }
        })

        return config
    }, [displayNames])

    const header = (
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
            <div className="space-y-1">
                <CardTitle>Klicks pro Link</CardTitle>
                <CardDescription>Tägliche Klicks, gestapelt nach Link.</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40" aria-label="Zeitraum">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="90d">Letzte 3 Monate</SelectItem>
                    <SelectItem value="30d">Letzte 30 Tage</SelectItem>
                    <SelectItem value="7d">Letzte 7 Tage</SelectItem>
                </SelectContent>
            </Select>
        </CardHeader>
    )

    if (loading || !clicks.length) {
        return (
            <Card>
                {header}
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-[280px] w-full" />
                    ) : (
                        <EmptyState variant="plain" icon={BarChart3} title="Noch keine Klicks" description="Sobald Links aufgerufen werden, erscheint hier der Verlauf." />
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            {header}
            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
                    <AreaChart data={chartData}>
                        <defs>
                            {displayNames.map((name, index) => (
                                <linearGradient key={name} id={`fill-click-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color(index)} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={color(index)} stopOpacity={0.02} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={formatDay}
                        />
                        <YAxis axisLine={false} tickLine={false} tickMargin={8} width={32} allowDecimals={false} domain={[0, "auto"]} />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => formatDay(String(value))}
                                    indicator="dashed"
                                />
                            }
                        />
                        {displayNames.map((name, index) => (
                            <Area
                                key={name}
                                dataKey={name}
                                type="monotone"
                                fill={`url(#fill-click-${index})`}
                                stroke={color(index)}
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
