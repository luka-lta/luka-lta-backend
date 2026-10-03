import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Sunrise, Sunset } from "lucide-react";
import type { WeatherForecastDay } from "@/api/weather/schema.ts";
import { getWeatherIcon } from "@/feature/dashboard/widgets/weatherIcons.ts";
import { daylightProgress, formatDaylightDuration, formatForecastWeekday, parseForecastTime, temperatureBounds } from "@/feature/weather/weatherData.ts";

interface SevenDayForecastCardProps {
    daily: WeatherForecastDay[];
}

export function SevenDayForecastCard({ daily }: SevenDayForecastCardProps) {
    if (daily.length === 0) return null;

    const bounds = temperatureBounds(daily);
    const today = daily[0];
    const progress = daylightProgress(today.sunrise, today.sunset);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">7-Tage-Vorhersage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {daily.map((day) => (
                    <DayRow key={day.date} day={day} bounds={bounds} />
                ))}

                <Separator className="my-3" />

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 shrink-0">
                        <Sunrise className="h-3.5 w-3.5" />
                        {parseForecastTime(today.sunrise).toFormat("HH:mm")}
                    </span>
                    <div className="relative flex-1 h-px bg-border">
                        {progress !== null && (
                            <span
                                className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-amber-500"
                                style={{ left: `${progress * 100}%` }}
                            />
                        )}
                    </div>
                    <span className="flex items-center gap-1.5 shrink-0">
                        <Sunset className="h-3.5 w-3.5" />
                        {parseForecastTime(today.sunset).toFormat("HH:mm")}
                    </span>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-1">
                    {formatDaylightDuration(today.sunrise, today.sunset)} Tageslicht
                </p>
            </CardContent>
        </Card>
    );
}

function DayRow({ day, bounds }: { day: WeatherForecastDay; bounds: { min: number; max: number } }) {
    const Icon = getWeatherIcon(day.icon);
    const date = parseForecastTime(day.date);
    const range = bounds.max - bounds.min || 1;
    const left = ((day.temperatureMinCelsius - bounds.min) / range) * 100;
    const width = Math.max(((day.temperatureMaxCelsius - day.temperatureMinCelsius) / range) * 100, 4);

    return (
        <div className="flex items-center gap-3 py-2 text-sm">
            <span className="w-20 shrink-0 text-muted-foreground">{formatForecastWeekday(date)}</span>
            <Icon className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="w-24 shrink-0 truncate text-muted-foreground hidden sm:inline">{day.condition}</span>
            <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
                {Math.round(day.temperatureMinCelsius)}°
            </span>
            <div className="relative flex-1 h-1 rounded-full bg-muted">
                <div
                    className="absolute h-1 rounded-full bg-amber-500/70"
                    style={{ left: `${left}%`, width: `${width}%` }}
                />
                <span
                    className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-amber-500"
                    style={{ left: `calc(${left + width}% - 4px)` }}
                />
            </div>
            <span className="w-8 shrink-0 tabular-nums font-medium">{Math.round(day.temperatureMaxCelsius)}°</span>
            <span className="w-10 shrink-0 text-right text-xs text-sky-500 tabular-nums">
                {day.precipitationProbabilityPercent > 0 ? `${day.precipitationProbabilityPercent}%` : ""}
            </span>
        </div>
    );
}
