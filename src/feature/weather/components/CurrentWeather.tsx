import { Droplets, Gauge, Sun, Sunrise, Sunset, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import type { WeatherForecastDay, WeatherReading } from "@/api/weather/schema.ts";
import { getWeatherIcon } from "@/feature/dashboard/widgets/weatherIcons.ts";
import { Metric, MetricList, WindDirectionIcon } from "@/feature/weather/components/WeatherMetric.tsx";
import {
    formatNumber,
    formatTemperature,
    formatWindDirection,
    levelIndex,
    sunTimes,
    UV_LEVELS,
} from "@/feature/weather/weatherData.ts";

interface CurrentWeatherProps {
    current: WeatherReading;
    /** Today's forecast for high/low and sun times; absent if the API sent no daily data. */
    today: WeatherForecastDay | null;
}

export function CurrentWeather({ current, today }: CurrentWeatherProps) {
    const Icon = getWeatherIcon(current.icon);
    const sun = today ? sunTimes(today) : null;

    return (
        <Card>
            <CardContent className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                        <p className="flex items-start font-semibold tabular-nums leading-none tracking-tighter">
                            <span className="text-7xl">{Math.round(current.temperatureCelsius) || 0}</span>
                            <span className="mt-1.5 text-3xl text-muted-foreground">°C</span>
                        </p>
                        <p className="mt-4 text-base font-medium">{current.condition}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                            Gefühlt {formatTemperature(current.apparentTemperatureCelsius)}
                            {today && (
                                <>
                                    {" · "}H {formatTemperature(today.temperatureMaxCelsius)}
                                    {" · "}T {formatTemperature(today.temperatureMinCelsius)}
                                </>
                            )}
                        </p>
                    </div>
                    <Icon className="size-16 shrink-0 text-warning sm:size-20" strokeWidth={1.25} aria-hidden />
                </div>

                <Separator className="my-5" />

                <MetricList className="grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6">
                    <Metric icon={Droplets} label="Luftfeuchte" value={`${formatNumber(current.humidityPercent)} %`} />
                    <Metric
                        icon={Wind}
                        label="Wind"
                        value={
                            <span className="flex items-center gap-1.5">
                                {formatNumber(current.windSpeedKmh)} km/h
                                <WindDirectionIcon degrees={current.windDirectionDegrees} className="text-muted-foreground" />
                                <span className="text-muted-foreground">{formatWindDirection(current.windDirectionDegrees)}</span>
                            </span>
                        }
                    />
                    <Metric icon={Gauge} label="Luftdruck" value={`${formatNumber(current.pressureMslHpa)} hPa`} />
                    {current.uvIndex !== null && (
                        <Metric
                            icon={Sun}
                            label="UV-Index"
                            value={formatNumber(current.uvIndex, 1)}
                            hint={UV_LEVELS[levelIndex(UV_LEVELS, current.uvIndex)].label}
                        />
                    )}
                    {sun && (
                        <>
                            <Metric icon={Sunrise} label="Sonnenaufgang" value={sun.sunrise.toFormat("HH:mm")} />
                            <Metric icon={Sunset} label="Sonnenuntergang" value={sun.sunset.toFormat("HH:mm")} />
                        </>
                    )}
                </MetricList>
            </CardContent>
        </Card>
    );
}
