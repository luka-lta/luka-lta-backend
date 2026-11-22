import { ChevronLeft, ChevronRight, CloudRain, Clock, Droplets, Sun, Sunrise, Sunset, Wind } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import type { WeatherForecastDay, WeatherHourPoint } from "@/api/weather/schema.ts";
import { getWeatherIcon } from "@/feature/dashboard/widgets/weatherIcons.ts";
import { Metric, MetricList, WindDirectionIcon } from "@/feature/weather/components/WeatherMetric.tsx";
import {
    formatDaylightDuration,
    formatForecastWeekday,
    formatNumber,
    formatTemperature,
    formatWindDirection,
    hoursOfDay,
    levelIndex,
    parseForecastTime,
    sunTimes,
    UV_LEVELS,
} from "@/feature/weather/weatherData.ts";

interface DailyForecastDetailsProps {
    daily: WeatherForecastDay[];
    hourly: WeatherHourPoint[];
    selectedDate: string | null;
    onSelectedDateChange: (date: string | null) => void;
}

export function DailyForecastDetails({ daily, hourly, selectedDate, onSelectedDateChange }: DailyForecastDetailsProps) {
    const index = daily.findIndex((day) => day.date === selectedDate);
    const day = index === -1 ? null : daily[index];

    return (
        <Sheet open={day !== null} onOpenChange={(open) => !open && onSelectedDateChange(null)}>
            <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
                {day && (
                    <DayDetails
                        day={day}
                        hours={hoursOfDay(hourly, parseForecastTime(day.date))}
                        onPrevious={index > 0 ? () => onSelectedDateChange(daily[index - 1].date) : undefined}
                        onNext={index < daily.length - 1 ? () => onSelectedDateChange(daily[index + 1].date) : undefined}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}

interface DayDetailsProps {
    day: WeatherForecastDay;
    hours: WeatherHourPoint[];
    onPrevious?: () => void;
    onNext?: () => void;
}

function DayDetails({ day, hours, onPrevious, onNext }: DayDetailsProps) {
    const date = parseForecastTime(day.date);
    const Icon = getWeatherIcon(day.icon);
    const sun = sunTimes(day);

    return (
        <>
            <SheetHeader className="space-y-1 border-b p-6 pr-12 text-left">
                <SheetTitle>{formatForecastWeekday(date)}</SheetTitle>
                <SheetDescription>{date.setLocale("de").toFormat("cccc, d. MMMM")}</SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1">
                <div className="space-y-6 p-6">
                    <div className="flex items-center gap-4">
                        <Icon className="size-12 shrink-0 text-warning" strokeWidth={1.25} aria-hidden />
                        <div>
                            <p className="text-3xl font-semibold tabular-nums tracking-tight">
                                {formatTemperature(day.temperatureMaxCelsius)}
                                <span className="ml-2 text-xl font-normal text-muted-foreground">
                                    {formatTemperature(day.temperatureMinCelsius)}
                                </span>
                            </p>
                            <p className="text-sm text-muted-foreground">{day.condition}</p>
                        </div>
                    </div>

                    <MetricList className="grid-cols-2">
                        <Metric
                            icon={CloudRain}
                            label="Niederschlag"
                            value={`${formatNumber(day.precipitationProbabilityPercent)} %`}
                            hint={`${formatNumber(day.precipitationSumMm, 1)} mm gesamt`}
                        />
                        {day.uvIndexMax !== null && (
                            <Metric
                                icon={Sun}
                                label="UV-Index max."
                                value={formatNumber(day.uvIndexMax, 1)}
                                hint={UV_LEVELS[levelIndex(UV_LEVELS, day.uvIndexMax)].label}
                            />
                        )}
                        {day.windSpeedMaxKmh != null && (
                            <Metric
                                icon={Wind}
                                label="Wind max."
                                value={
                                    <span className="flex items-center gap-1.5">
                                        {formatNumber(day.windSpeedMaxKmh)} km/h
                                        {day.windDirectionDominantDegrees != null && (
                                            <>
                                                <WindDirectionIcon degrees={day.windDirectionDominantDegrees} className="text-muted-foreground" />
                                                <span className="text-muted-foreground">{formatWindDirection(day.windDirectionDominantDegrees)}</span>
                                            </>
                                        )}
                                    </span>
                                }
                                hint={day.windGustsMaxKmh != null ? `Böen bis ${formatNumber(day.windGustsMaxKmh)} km/h` : undefined}
                            />
                        )}
                        {sun && (
                            <>
                                <Metric icon={Sunrise} label="Sonnenaufgang" value={sun.sunrise.toFormat("HH:mm")} />
                                <Metric icon={Sunset} label="Sonnenuntergang" value={sun.sunset.toFormat("HH:mm")} />
                                <Metric icon={Clock} label="Tageslänge" value={formatDaylightDuration(day.sunrise, day.sunset)} />
                            </>
                        )}
                    </MetricList>

                    {hours.length > 0 && (
                        <>
                            <Separator />
                            <section>
                                <h3 className="mb-2 text-sm font-medium">Stündlich</h3>
                                <ul className="divide-y divide-border/60 text-sm">
                                    {hours.map((hour) => {
                                        const HourIcon = getWeatherIcon(hour.icon);
                                        return (
                                            <li key={hour.time} className="grid grid-cols-[3rem_1.25rem_1fr_3.5rem_3rem] items-center gap-3 py-2">
                                                <span className="tabular-nums text-muted-foreground">{parseForecastTime(hour.time).toFormat("HH:mm")}</span>
                                                <HourIcon className="size-4 text-warning" aria-hidden />
                                                <span className="truncate text-muted-foreground">{hour.condition}</span>
                                                <span className="flex items-center justify-end gap-1 tabular-nums text-info">
                                                    <Droplets className="size-3" aria-hidden />
                                                    {formatNumber(hour.precipitationProbabilityPercent)}%
                                                </span>
                                                <span className="text-right font-medium tabular-nums">
                                                    {formatTemperature(hour.temperatureCelsius)}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        </>
                    )}
                </div>
            </ScrollArea>

            <div className="flex items-center justify-between gap-2 border-t p-4">
                <Button variant="ghost" size="sm" onClick={onPrevious} disabled={!onPrevious}>
                    <ChevronLeft />
                    Vorheriger Tag
                </Button>
                <Button variant="ghost" size="sm" onClick={onNext} disabled={!onNext}>
                    Nächster Tag
                    <ChevronRight />
                </Button>
            </div>
        </>
    );
}
