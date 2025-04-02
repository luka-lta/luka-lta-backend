import {Badge} from "@/components/ui/badge.tsx";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";

interface ServiceData {
    name: string;
    status: 'active' | 'inactive';
}

const data: ServiceData[] = [
    {
        name: 'Nginx',
        status: 'active'
    },
    {
        name: 'PHP-FPM',
        status: 'active'
    },
    {
        name: 'MySQL',
        status: 'inactive'
    },
    {
        name: 'Redis',
        status: 'active'
    }
];

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

function ServicesCard() {
    const getStatusBadge = (status: ServiceData['status']) => {
        const variants = {
            active: { class: 'bg-green-500 hover:bg-green-600', text: 'Active' },
            inactive: { class: 'bg-red-500 hover:bg-red-600', text: 'Inactive' }
        }
        return <Badge className={variants[status].class}>{variants[status].text}</Badge>
    }

    return (
        <div className="flex h-full w-full flex-col p-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Services</h2>
                <p className='text-gray-600 text-sm'>In Last 30 Minutes</p>
            </div>

            <h4 className="mt-5 text-sm font-semibold ">Service Status</h4>
            <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}

                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={2} />
                </BarChart>
            </ChartContainer>

            <table>
                <thead>
                <tr className="m-0 border-t p-0 even:bg-muted">
                    <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                        Services
                    </th>
                    <th className="border px-4 py-2 text-right font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                        Status
                    </th>
                </tr>
                </thead>
                <tbody>
                {data.map((service, index) => (
                    <tr key={index} className="m-0 border-t text-sm p-0 even:bg-muted">
                        <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                            {service.name}
                        </td>
                        <td className="border px-4 py-2 text-right [&[align=center]]:text-center [&[align=right]]:text-right">
                            {getStatusBadge(service.status)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default ServicesCard;