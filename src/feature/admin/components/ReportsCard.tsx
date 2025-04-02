import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart.tsx";
import {AreaChart, XAxis, CartesianGrid, Area, YAxis} from "recharts";

const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

const stats = [
    { title: "REST Requests", value: "10,234", color: "bg-red-700" },
];

function ReportsCard() {
    return (
        <Card className='rounded-2xl'>
            <CardContent>
                <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>Graph for Reports Informations</CardDescription>
                </CardHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {stats.map((stat, index) => (
                            <Card key={index} className={`${stat.color} text-white`}>
                                <CardContent className="p-4">
                                    <div className="text-sm">{stat.title}</div>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                <ChartContainer config={chartConfig}>
                <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                    <YAxis axisLine={false} tickLine={false} tickMargin={8} domain={[0, "auto"]} />
                    <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line"/>}
                        />
                        <Area
                            dataKey="desktop"
                            type="bump"
                            fill="var(--color-desktop)"
                            fillOpacity={0.4}
                            stroke="var(--color-desktop)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default ReportsCard;