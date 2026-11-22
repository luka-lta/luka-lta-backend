import { Leaf } from "lucide-react";
import type { WeatherAirQuality } from "@/api/weather/schema.ts";
import { InfoCard } from "@/feature/weather/components/InfoCard.tsx";
import { LevelScale } from "@/feature/weather/components/LevelScale.tsx";
import { Metric, MetricList } from "@/feature/weather/components/WeatherMetric.tsx";
import { AQI_LEVELS, formatNumber, levelIndex, parseForecastTime } from "@/feature/weather/weatherData.ts";

export function AirQuality({ airQuality }: { airQuality: WeatherAirQuality | null }) {
    if (airQuality === null) return null;

    const { europeanAqi, pm25, pm10 } = airQuality;
    const measuredAt = parseForecastTime(airQuality.measuredAt);
    if (europeanAqi === null && pm25 === null && pm10 === null) return null;

    return (
        <InfoCard
            icon={Leaf}
            title="Luftqualität"
            aside={measuredAt.isValid ? `Stand ${measuredAt.toFormat("HH:mm")}` : undefined}
        >
            {europeanAqi !== null && (
                <>
                    <p className="flex items-baseline gap-2">
                        <span className="text-3xl font-semibold tabular-nums tracking-tight">{formatNumber(europeanAqi)}</span>
                        <span className="text-sm font-medium text-warning">{AQI_LEVELS[levelIndex(AQI_LEVELS, europeanAqi)].label}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">Europäischer Luftqualitätsindex</p>
                </>
            )}
            <div className="mt-auto space-y-4 pt-5">
                {europeanAqi !== null && (
                    <LevelScale levels={AQI_LEVELS} activeIndex={levelIndex(AQI_LEVELS, europeanAqi)} label="Luftqualität" />
                )}
                <MetricList className="grid-cols-2">
                    {pm25 !== null && <Metric label="Feinstaub PM2.5" value={`${formatNumber(pm25, 1)} µg/m³`} />}
                    {pm10 !== null && <Metric label="Feinstaub PM10" value={`${formatNumber(pm10, 1)} µg/m³`} />}
                </MetricList>
            </div>
        </InfoCard>
    );
}
