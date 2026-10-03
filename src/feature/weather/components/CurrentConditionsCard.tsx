import { Card, CardContent } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Droplets, Gauge, Sun, Wind } from "lucide-react";
import type { WeatherReading } from "@/api/weather/schema.ts";
import { getWeatherIcon } from "@/feature/dashboard/widgets/weatherIcons.ts";
import { formatWindDirection } from "@/feature/weather/weatherData.ts";

interface CurrentConditionsCardProps {
    current: WeatherReading;
}

export function CurrentConditionsCard({ current }: CurrentConditionsCardProps) {
    const Icon = getWeatherIcon(current.icon);

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <Icon className="h-12 w-12 text-amber-500 shrink-0" />
                    <div>
                        <p className="text-4xl font-bold tabular-nums leading-none">
                            {Math.round(current.temperatureCelsius)}°C
                        </p>
                        <p className="text-muted-foreground mt-1.5">
                            Gefühlt {Math.round(current.apparentTemperatureCelsius)}°C · {current.condition}
                        </p>
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <Stat icon={Droplets} value={`${current.humidityPercent}%`} />
                    <Stat
                        icon={Wind}
                        value={`${Math.round(current.windSpeedKmh)} km/h ${formatWindDirection(current.windDirectionDegrees)}`}
                    />
                    <Stat icon={Gauge} value={`${Math.round(current.pressureMslHpa)} hPa`} />
                    {current.uvIndex !== null && <Stat icon={Sun} value={`UV ${current.uvIndex.toFixed(1)}`} />}
                </div>
            </CardContent>
        </Card>
    );
}

function Stat({ icon: Icon, value }: { icon: typeof Droplets; value: string }) {
    return (
        <span className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span className="font-medium text-foreground">{value}</span>
        </span>
    );
}
