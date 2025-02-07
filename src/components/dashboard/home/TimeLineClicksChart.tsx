import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart.tsx";

type ClickData = {
    timestamp: string;
    clicks: number;
};

interface LineChartProps {
    data: ClickData[];
}

const chartConfig = {
    clicks: {
        label: "Clicks",
        color: "#7D3C98",
    },
} satisfies ChartConfig;

const TimeLineClicksChart: React.FC<LineChartProps> = () => {
    const today = new Date();

    const getRandomDate = () => {
        const randomOffset = Math.floor(Math.random() * 7);
        const randomDate = new Date();
        randomDate.setDate(today.getDate() - randomOffset);
        return randomDate.toISOString().split('T')[0];
    };

    // Funktion, um Klickzahlen zufällig zu variieren
    const getRandomVariation = (value: number) => {
        const variation = Math.floor(Math.random() * 21) - 10;
        return Math.max(value + variation, 0);
    };

    // Generiere zufällige Daten für die letzten sieben Tage
    const generateRandomData = () => {
        const randomData: ClickData[] = [];
        for (let i = 0; i < 7; i++) {
            const timestamp = getRandomDate();
            const clicks = Math.floor(Math.random() * 500) + 1;
            randomData.push({
                timestamp,
                clicks: getRandomVariation(clicks),
            });
        }
        return randomData;
    };

    // Erstelle zufällige Daten
    const variedData = generateRandomData();

    return (
        <div className="flex h-full w-full flex-col p-4">
            <h2 className="text-sm font-semibold text-gray-500">Clicks over time (Last 7 days)</h2>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <LineChart data={variedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="timestamp"
                        tickLine={false}
                        axisLine={true}
                        tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { weekday: "short" })}
                    />
                    <YAxis tickLine={false} axisLine={true} tickFormatter={(value) => `${value}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                        type="linear"
                        dataKey="clicks"
                        stroke="var(--color-clicks)"
                        strokeWidth={1}
                        dot={{ fill: "var(--color-clicks)", strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent/>}/>
                    <ChartLegend content={<ChartLegendContent/>}/>
                </LineChart>
            </ChartContainer>
        </div>
    );
};

export default TimeLineClicksChart;
