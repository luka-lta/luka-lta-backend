import { useState } from "react";
import { Droplets } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import type { WeatherForecastDay, WeatherHourPoint } from "@/api/weather/schema.ts";
import { getWeatherIcon } from "@/feature/dashboard/widgets/weatherIcons.ts";
import { DailyForecastDetails } from "@/feature/weather/components/DailyForecastDetails.tsx";
import {
    formatForecastWeekday,
    formatNumber,
    formatTemperature,
    parseForecastTime,
    temperatureBounds,
} from "@/feature/weather/weatherData.ts";

/** Minimum width (percent) of a temperature range bar so tiny ranges stay visible. */
const MIN_RANGE_WIDTH_PERCENT = 6;

/** Precipitation amounts below this (mm) are not worth a label. */
const PRECIPITATION_LABEL_MIN_MM = 0.1;

interface DailyForecastProps {
    daily: WeatherForecastDay[];
    hourly: WeatherHourPoint[];
    /** Current temperature, marked on today's range bar. */
    currentTemperature: number | null;
}

export function DailyForecast({ daily, hourly, currentTemperature }: DailyForecastProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    if (daily.length === 0) return null;

    const bounds = temperatureBounds(daily);

    return (
        <Card>
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
                <CardTitle>{daily.length} Tage</CardTitle>
                <CardDescription>Tag antippen für Details</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
                <ul className="space-y-0.5">
                    {daily.map((day, index) => (
                        <li key={day.date}>
                            <DayRow
                                day={day}
                                bounds={bounds}
                                currentTemperature={index === 0 ? currentTemperature : null}
                                onSelect={() => setSelectedDate(day.date)}
                            />
                        </li>
                    ))}
                </ul>
            </CardContent>

            <DailyForecastDetails
                daily={daily}
                hourly={hourly}
                selectedDate={selectedDate}
                onSelectedDateChange={setSelectedDate}
            />
        </Card>
    );
}

interface DayRowProps {
    day: WeatherForecastDay;
    bounds: { min: number; max: number };
    currentTemperature: number | null;
    onSelect: () => void;
}

function DayRow({ day, bounds, currentTemperature, onSelect }: DayRowProps) {
    const Icon = getWeatherIcon(day.icon);
    const date = parseForecastTime(day.date);
    const range = bounds.max - bounds.min || 1;
    const left = ((day.temperatureMinCelsius - bounds.min) / range) * 100;
    const width = Math.max(((day.temperatureMaxCelsius - day.temperatureMinCelsius) / range) * 100, MIN_RANGE_WIDTH_PERCENT);
    const currentPosition = currentTemperature !== null
        ? Math.min(Math.max((currentTemperature - bounds.min) / range, 0), 1) * 100
        : null;
    const hasPrecipitation = day.precipitationProbabilityPercent > 0;

    return (
        <button
            type="button"
            onClick={onSelect}
            className="grid w-full grid-cols-[5.75rem_1.25rem_2.5rem_2rem_minmax(3rem,1fr)_2rem] items-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-sm outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${formatForecastWeekday(date)}: ${day.condition}, ${formatTemperature(day.temperatureMinCelsius)} bis ${formatTemperature(day.temperatureMaxCelsius)}. Details öffnen`}
        >
            <span className="truncate font-medium">{formatForecastWeekday(date)}</span>
            <Icon className="size-5 text-warning" strokeWidth={1.75} aria-hidden />
            <span className="flex flex-col text-[11px] leading-tight tabular-nums text-info">
                {hasPrecipitation && (
                    <span className="flex items-center gap-0.5">
                        <Droplets className="size-3" aria-hidden />
                        {formatNumber(day.precipitationProbabilityPercent)}%
                    </span>
                )}
                {day.precipitationSumMm >= PRECIPITATION_LABEL_MIN_MM && (
                    <span className="text-muted-foreground">{formatNumber(day.precipitationSumMm, 1)} mm</span>
                )}
            </span>
            <span className="text-right tabular-nums text-muted-foreground">{formatTemperature(day.temperatureMinCelsius)}</span>
            <span className="relative h-1.5 rounded-full bg-muted" aria-hidden>
                <span
                    className="absolute inset-y-0 rounded-full bg-warning/80"
                    style={{ left: `${left}%`, width: `${width}%` }}
                />
                {currentPosition !== null && (
                    <span
                        className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground"
                        style={{ left: `${currentPosition}%` }}
                    />
                )}
            </span>
            <span className="tabular-nums font-medium">{formatTemperature(day.temperatureMaxCelsius)}</span>
        </button>
    );
}
