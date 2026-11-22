import { CloudRain, Droplets, Thermometer, Wind, type LucideIcon } from "lucide-react";
import type { WeatherHourPoint } from "@/api/weather/schema.ts";
import { formatNumber, formatTemperature } from "@/feature/weather/weatherData.ts";

export type HourlyMetricKey = "temperature" | "precipitation" | "wind" | "humidity";

export interface HourlyMetric {
    key: HourlyMetricKey;
    label: string;
    icon: LucideIcon;
    /** CSS color of series, tooltip marker and selection. */
    color: string;
    /** How the series is drawn: a smooth curve or one bar per hour. */
    shape: "area" | "bar";
    /** Fixed y domain, or padding around the data range for open-ended values. */
    domain: [number | ((min: number) => number), number | ((max: number) => number)];
    value: (hour: WeatherHourPoint) => number | null;
    /** Short label printed above each hour column. */
    format: (value: number) => string;
    /** Longer label for tooltip and detail panel. */
    formatLong: (value: number) => string;
}

/** Degrees added below/above the temperature range so the curve never touches the edges. */
const TEMPERATURE_PADDING = 2;

/** Headroom above the strongest wind of the window, in km/h. */
const WIND_HEADROOM_KMH = 5;

export const HOURLY_METRICS: HourlyMetric[] = [
    {
        key: "temperature",
        label: "Temperatur",
        icon: Thermometer,
        color: "hsl(var(--warning))",
        shape: "area",
        domain: [(min) => Math.floor(min - TEMPERATURE_PADDING), (max) => Math.ceil(max + TEMPERATURE_PADDING)],
        value: (hour) => hour.temperatureCelsius,
        format: formatTemperature,
        formatLong: (value) => `${formatNumber(value, 1)} °C`,
    },
    {
        key: "precipitation",
        label: "Niederschlag",
        icon: CloudRain,
        color: "hsl(var(--info))",
        shape: "bar",
        domain: [0, 100],
        value: (hour) => hour.precipitationProbabilityPercent,
        format: (value) => `${formatNumber(value)}%`,
        formatLong: (value) => `${formatNumber(value)} % Wahrscheinlichkeit`,
    },
    {
        key: "wind",
        label: "Wind",
        icon: Wind,
        color: "hsl(var(--chart-2))",
        shape: "area",
        domain: [0, (max) => Math.ceil(max + WIND_HEADROOM_KMH)],
        value: (hour) => hour.windSpeedKmh ?? null,
        format: (value) => formatNumber(value),
        formatLong: (value) => `${formatNumber(value)} km/h`,
    },
    {
        key: "humidity",
        label: "Luftfeuchte",
        icon: Droplets,
        color: "hsl(var(--chart-3))",
        shape: "area",
        domain: [0, 100],
        value: (hour) => hour.humidityPercent ?? null,
        format: (value) => `${formatNumber(value)}%`,
        formatLong: (value) => `${formatNumber(value)} % relative Feuchte`,
    },
];

/** Metrics the API actually delivered for at least one hour — the rest is not offered. */
export function availableMetrics(hourly: WeatherHourPoint[]): HourlyMetric[] {
    return HOURLY_METRICS.filter((metric) => hourly.some((hour) => metric.value(hour) !== null));
}
