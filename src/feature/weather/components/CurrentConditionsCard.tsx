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
            <CardContent className="pt-5">
                <div className="flex items-center gap-4">
                    <Icon className="size-12 shrink-0 text-warning" aria-hidden />
                    <div>
                        <p className="text-4xl font-semibold tabular-nums leading-none">
                            {Math.round(current.temperatureCelsius)} °C
                        </p>
                        <p className="text-muted-foreground mt-1.5">
                            gefühlt {Math.round(current.apparentTemperatureCelsius)} °C · {current.condition}
                        </p>
                    </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <Stat icon={Droplets} label="Luftfeuchte" value={`${current.humidityPercent} %`} />
                    <Stat
                        icon={Wind}
                        label="Wind"
                        value={`${Math.round(current.windSpeedKmh)} km/h ${formatWindDirection(current.windDirectionDegrees)}`}
                    />
                    <Stat icon={Gauge} label="Luftdruck" value={`${Math.round(current.pressureMslHpa)} hPa`} />
                    {current.uvIndex !== null && <Stat icon={Sun} label="UV-Index" value={`UV ${current.uvIndex.toLocaleString("de-DE", { maximumFractionDigits: 1 })}`} />}
                </div>
            </CardContent>
        </Card>
    );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
    return (
        <span className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="size-4" aria-hidden />
            <span className="sr-only">{label}:</span>
            <span className="font-medium text-foreground">{value}</span>
        </span>
    );
}
