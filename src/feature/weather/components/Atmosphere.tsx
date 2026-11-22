import { Cloud, CloudRain, Droplets, Eye, Layers } from "lucide-react";
import type { WeatherHourPoint, WeatherReading } from "@/api/weather/schema.ts";
import { InfoCard } from "@/feature/weather/components/InfoCard.tsx";
import { Metric, MetricList } from "@/feature/weather/components/WeatherMetric.tsx";
import { formatNumber, formatTemperature, formatVisibility } from "@/feature/weather/weatherData.ts";

interface AtmosphereProps {
    current: WeatherReading;
    /** Forecast hour covering now — source for dew point and visibility, which the current reading lacks. */
    currentHour: WeatherHourPoint | null;
}

export function Atmosphere({ current, currentHour }: AtmosphereProps) {
    return (
        <InfoCard icon={Layers} title="Atmosphäre">
            <MetricList className="grid-cols-2">
                <Metric icon={Cloud} label="Bewölkung" value={`${formatNumber(current.cloudCoverPercent)} %`} />
                <Metric icon={CloudRain} label="Niederschlag" value={`${formatNumber(current.precipitationMm, 1)} mm`} hint="aktuell" />
                {currentHour?.dewPointCelsius != null && (
                    <Metric
                        icon={Droplets}
                        label="Taupunkt"
                        value={formatTemperature(currentHour.dewPointCelsius)}
                        hint={`bei ${formatNumber(current.humidityPercent)} % Feuchte`}
                    />
                )}
                {currentHour?.visibilityMeters != null && (
                    <Metric icon={Eye} label="Sichtweite" value={formatVisibility(currentHour.visibilityMeters)} />
                )}
            </MetricList>
        </InfoCard>
    );
}
