import { useMemo, useState } from "react";
import { CloudRain, Cloud, Droplets, Eye, Sun, Thermometer, Wind } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import type { WeatherForecastDay, WeatherHourPoint } from "@/api/weather/schema.ts";
import { availableMetrics, type HourlyMetricKey } from "@/feature/weather/hourlyMetrics.ts";
import { HourlyForecastChart, type SunEvent } from "@/feature/weather/components/HourlyForecastChart.tsx";
import { Metric, MetricList, WindDirectionIcon } from "@/feature/weather/components/WeatherMetric.tsx";
import { useNow } from "@/feature/weather/useNow.ts";
import {
    findCurrentHour,
    formatNumber,
    formatTemperature,
    formatVisibility,
    formatWindDirection,
    levelIndex,
    parseForecastTime,
    sunTimes,
    UV_LEVELS,
} from "@/feature/weather/weatherData.ts";

interface HourlyForecastProps {
    hourly: WeatherHourPoint[];
    daily: WeatherForecastDay[];
}

export function HourlyForecast({ hourly, daily }: HourlyForecastProps) {
    const now = useNow();
    const metrics = useMemo(() => availableMetrics(hourly), [hourly]);
    const [metricKey, setMetricKey] = useState<HourlyMetricKey>("temperature");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const sunEvents = useMemo<SunEvent[]>(
        () => daily.flatMap((day) => {
            const sun = sunTimes(day);
            if (!sun) return [];
            return [
                { kind: "sunrise" as const, time: sun.sunrise },
                { kind: "sunset" as const, time: sun.sunset },
            ];
        }),
        [daily],
    );

    if (hourly.length === 0 || metrics.length === 0) return null;

    const activeMetric = metrics.find((metric) => metric.key === metricKey) ?? metrics[0];
    const selectedHour = hourly.find((hour) => hour.time === selectedTime) ?? findCurrentHour(hourly);

    return (
        <Card>
            <Tabs value={activeMetric.key} onValueChange={(value) => setMetricKey(value as HourlyMetricKey)}>
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 p-5 pb-2 sm:p-6 sm:pb-2">
                    <div className="space-y-1">
                        <CardTitle>Stündlich</CardTitle>
                        <CardDescription>Nächste {hourly.length} Stunden · Stunde antippen für Details</CardDescription>
                    </div>
                    {metrics.length > 1 && (
                        <TabsList className="max-w-full justify-start overflow-x-auto" aria-label="Diagrammdaten">
                            {metrics.map((metric) => (
                                <TabsTrigger key={metric.key} value={metric.key}>
                                    <metric.icon aria-hidden />
                                    <span className="hidden sm:inline">{metric.label}</span>
                                    <span className="sr-only sm:hidden">{metric.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    )}
                </CardHeader>

                <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
                    {metrics.map((metric) => (
                        <TabsContent
                            key={metric.key}
                            value={metric.key}
                            className="mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300"
                        >
                            <HourlyForecastChart
                                hourly={hourly}
                                metric={metric}
                                sunEvents={sunEvents}
                                now={now}
                                selectedTime={selectedHour?.time ?? null}
                                onSelect={setSelectedTime}
                            />
                        </TabsContent>
                    ))}

                    {selectedHour && (
                        <>
                            <Separator className="my-4" />
                            <HourDetails hour={selectedHour} isNow={parseForecastTime(selectedHour.time).hasSame(now, "hour")} />
                        </>
                    )}
                </CardContent>
            </Tabs>
        </Card>
    );
}

function HourDetails({ hour, isNow }: { hour: WeatherHourPoint; isNow: boolean }) {
    const time = parseForecastTime(hour.time);

    return (
        <section aria-live="polite" aria-label="Details zur gewählten Stunde">
            <p className="mb-3 text-sm">
                <span className="font-medium tabular-nums">{isNow ? "Jetzt" : `${time.toFormat("HH:mm")} Uhr`}</span>
                <span className="text-muted-foreground"> · {hour.condition}</span>
            </p>
            <MetricList className="grid-cols-2 sm:grid-cols-4">
                <Metric icon={Thermometer} label="Temperatur" value={formatTemperature(hour.temperatureCelsius)} />
                <Metric
                    icon={CloudRain}
                    label="Niederschlag"
                    value={`${formatNumber(hour.precipitationProbabilityPercent)} %`}
                    hint={`${formatNumber(hour.precipitationMm, 1)} mm`}
                />
                {hour.windSpeedKmh != null && (
                    <Metric
                        icon={Wind}
                        label="Wind"
                        value={
                            <span className="flex items-center gap-1.5">
                                {formatNumber(hour.windSpeedKmh)} km/h
                                {hour.windDirectionDegrees != null && (
                                    <>
                                        <WindDirectionIcon degrees={hour.windDirectionDegrees} className="text-muted-foreground" />
                                        <span className="text-muted-foreground">{formatWindDirection(hour.windDirectionDegrees)}</span>
                                    </>
                                )}
                            </span>
                        }
                        hint={hour.windGustsKmh != null ? `Böen ${formatNumber(hour.windGustsKmh)} km/h` : undefined}
                    />
                )}
                {hour.humidityPercent != null && (
                    <Metric
                        icon={Droplets}
                        label="Luftfeuchte"
                        value={`${formatNumber(hour.humidityPercent)} %`}
                        hint={hour.dewPointCelsius != null ? `Taupunkt ${formatTemperature(hour.dewPointCelsius)}` : undefined}
                    />
                )}
                {hour.cloudCoverPercent != null && (
                    <Metric icon={Cloud} label="Bewölkung" value={`${formatNumber(hour.cloudCoverPercent)} %`} />
                )}
                {hour.visibilityMeters != null && (
                    <Metric icon={Eye} label="Sichtweite" value={formatVisibility(hour.visibilityMeters)} />
                )}
                {hour.uvIndex != null && hour.isDay !== false && (
                    <Metric
                        icon={Sun}
                        label="UV-Index"
                        value={formatNumber(hour.uvIndex, 1)}
                        hint={UV_LEVELS[levelIndex(UV_LEVELS, hour.uvIndex)].label}
                    />
                )}
            </MetricList>
        </section>
    );
}
