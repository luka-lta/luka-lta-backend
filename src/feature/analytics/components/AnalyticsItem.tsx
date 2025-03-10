import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import { useState } from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@radix-ui/react-select";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";

const chartData = [
    { date: "2024-04-01", referral_1: 222, referral_2: 150 },
    { date: "2024-04-02", referral_1: 97, referral_2: 180 },
    { date: "2024-04-03", referral_1: 167, referral_2: 120 },
    { date: "2024-04-04", referral_1: 242, referral_2: 260 },
    { date: "2024-04-05", referral_1: 373, referral_2: 290, referral_3: 23 },
    { date: "2024-04-06", referral_1: 301, referral_2: 340, referral_3: 23 },
    { date: "2024-04-07", referral_1: 245, referral_2: 180, referral_3: 23 },
    { date: "2024-04-08", referral_1: 409, referral_2: 320, referral_3: 234 },
    { date: "2024-04-09", referral_1: 59, referral_2: 110 },
    { date: "2024-04-10", referral_1: 261, referral_2: 190 },
    { date: "2024-04-11", referral_1: 327, referral_2: 350 },
    { date: "2024-04-12", referral_1: 292, referral_2: 210 },
    { date: "2024-04-13", referral_1: 342, referral_2: 380 },
    { date: "2024-04-14", referral_1: 137, referral_2: 220 },
    { date: "2024-04-15", referral_1: 120, referral_2: 170 },
    { date: "2024-04-16", referral_1: 138, referral_2: 190 },
    { date: "2024-04-17", referral_1: 446, referral_2: 360 },
    { date: "2024-04-18", referral_1: 364, referral_2: 410 },
    { date: "2024-04-19", referral_1: 243, referral_2: 2 },
    { date: "2024-04-20", referral_1: 89, referral_2: 2 },
    { date: "2024-04-21", referral_1: 137, referral_2: 2 },
    { date: "2024-04-22", referral_1: 224, referral_2: 2 },
    { date: "2024-04-23", referral_1: 138, referral_2: 2 },
    { date: "2024-04-24", referral_1: 387, referral_2: 2 },
    { date: "2024-04-25", referral_1: 215, referral_2: 2 },
    { date: "2024-04-26", referral_1: 75, referral_2: 130 },
    { date: "2024-04-27", referral_1: 383, referral_2: 420 },
    { date: "2024-04-28", referral_1: 122, referral_2: 180 },
    { date: "2024-04-29", referral_1: 315, referral_2: 240 },
    { date: "2024-04-30", referral_1: 454, referral_2: 380 },
    { date: "2024-05-01", referral_1: 165, referral_2: 220 },
    { date: "2024-05-02", referral_1: 293, referral_2: 310 },
    { date: "2024-05-03", referral_1: 247, referral_2: 190 },
    { date: "2024-05-04", referral_1: 385, referral_2: 420 },
    { date: "2024-05-05", referral_1: 481, referral_2: 390 },
    { date: "2024-05-06", referral_1: 498, referral_2: 520 },
    { date: "2024-05-07", referral_1: 388, referral_2: 300 },
    { date: "2024-05-08", referral_1: 149, referral_2: 210 },
    { date: "2024-05-09", referral_1: 227, referral_2: 180 },
    { date: "2024-05-10", referral_1: 293, referral_2: 330 },
    { date: "2024-05-11", referral_1: 335, referral_2: 270 },
    { date: "2024-05-12", referral_1: 197, referral_2: 240 },
    { date: "2024-05-13", referral_1: 197, referral_2: 160 },
    { date: "2024-05-14", referral_1: 448, referral_2: 490 },
    { date: "2024-05-15", referral_1: 473, referral_2: 380 },
    { date: "2024-05-16", referral_1: 338, referral_2: 400 },
    { date: "2024-05-17", referral_1: 499, referral_2: 420 },
    { date: "2024-05-18", referral_1: 315, referral_2: 350 },
    { date: "2024-05-19", referral_1: 235, referral_2: 180 },
    { date: "2024-05-20", referral_1: 177, referral_2: 230 },
    { date: "2024-05-21", referral_1: 82, referral_2: 140 },
    { date: "2024-05-22", referral_1: 81, referral_2: 120 },
    { date: "2024-05-23", referral_1: 252, referral_2: 290 },
    { date: "2024-05-24", referral_1: 294, referral_2: 220 },
    { date: "2024-05-25", referral_1: 201, referral_2: 250 },
    { date: "2024-05-26", referral_1: 213, referral_2: 170 },
    { date: "2024-05-27", referral_1: 420, referral_2: 460 },
    { date: "2024-05-28", referral_1: 233, referral_2: 190 },
    { date: "2024-05-29", referral_1: 78, referral_2: 130 },
    { date: "2024-05-30", referral_1: 340, referral_2: 280 },
    { date: "2024-05-31", referral_1: 178, referral_2: 230 },
    { date: "2024-06-01", referral_1: 178, referral_2: 200 },
    { date: "2024-06-02", referral_1: 470, referral_2: 410 },
    { date: "2024-06-03", referral_1: 103, referral_2: 160 },
    { date: "2024-06-04", referral_1: 439, referral_2: 380 },
    { date: "2024-06-05", referral_1: 88, referral_2: 140 },
    { date: "2024-06-06", referral_1: 294, referral_2: 250 },
    { date: "2024-06-07", referral_1: 323, referral_2: 370 },
    { date: "2024-06-08", referral_1: 385, referral_2: 320 },
    { date: "2024-06-09", referral_1: 438, referral_2: 480 },
    { date: "2024-06-10", referral_1: 155, referral_2: 200 },
    { date: "2024-06-11", referral_1: 92, referral_2: 150 },
    { date: "2024-06-12", referral_1: 492, referral_2: 420 },
    { date: "2024-06-13", referral_1: 81, referral_2: 130 },
    { date: "2024-06-14", referral_1: 426, referral_2: 380 },
    { date: "2024-06-15", referral_1: 307, referral_2: 350 },
    { date: "2024-06-16", referral_1: 371, referral_2: 310 },
    { date: "2024-06-17", referral_1: 475, referral_2: 520 },
    { date: "2024-06-18", referral_1: 107, referral_2: 170 },
    { date: "2024-06-19", referral_1: 341, referral_2: 290 },
    { date: "2024-06-20", referral_1: 408, referral_2: 450 },
    { date: "2024-06-21", referral_1: 169, referral_2: 210, referral_3: 4  },
    { date: "2024-06-22", referral_1: 317, referral_2: 270, referral_3: 4  },
    { date: "2024-06-23", referral_1: 480, referral_2: 530, referral_3: 4  },
    { date: "2024-06-24", referral_1: 132, referral_2: 180, referral_3: 4  },
    { date: "2024-06-25", referral_1: 141, referral_2: 190, referral_3: 423},
    { date: "2024-06-26", referral_1: 434, referral_2: 380, referral_3: 42 },
    { date: "2024-06-27", referral_1: 448, referral_2: 490, referral_3: 4 },
    { date: "2024-06-28", referral_1: 149, referral_2: 30, referral_3: 300 },
    { date: "2024-06-29", referral_1: 103, referral_2: 160, referral_3: 300 },
    { date: "2024-06-30", referral_1: 446, referral_2: 400 },
]

const chartConfig = {
    referral_1: {
        label: "Referral-1",
        color: "hsl(var(--chart-1))",
    },
    referral_2: {
        label: "Referral-2",
        color: "hsl(var(--chart-2))",
    },
    referral_3: {
        label: "Referral-3",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig


function AnalyticsItem() {
    const [timeRange, setTimeRange] = useState("90d")

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
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Click Events</CardTitle>
                    <CardDescription>
                        Showing the total Referral Click Events
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[160px] rounded-lg sm:ml-auto"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
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
                                    stopColor="var(--color-referral_1)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-referral_1)"
                                    stopOpacity={0.0}
                                />
                            </linearGradient>
                            <linearGradient id="fillReferral2" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-referral_2)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-referral_2)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillReferral3" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-referral_3)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-referral_3)"
                                    stopOpacity={0.1}
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
                            dataKey="referral_1"
                            type="bump"
                            fill="url(#fillReferral1)"
                            stroke="var(--color-referral_1)"
                            stackId="a"
                        />
                        <Area
                            dataKey="referral_2"
                            type="bump"
                            fill="url(#fillReferral2)"
                            stroke="var(--color-referral_2)"
                            stackId="a"
                        />
                        <Area
                            dataKey="referral_3"
                            type="bump"
                            fill="url(#fillReferral3)"
                            stroke="var(--color-referral_3)"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default AnalyticsItem;