import { useMemo } from "react";
import type { DateTime } from "luxon";
import { useReducedMotion } from "motion/react";
import { Area, Bar, ComposedChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Sunrise, Sunset } from "lucide-react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart.tsx";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area.tsx";
import { cn } from "@/lib/utils.ts";
import type { WeatherHourPoint } from "@/api/weather/schema.ts";
import { getWeatherIcon } from "@/feature/dashboard/widgets/weatherIcons.ts";
import type { HourlyMetric } from "@/feature/weather/hourlyMetrics.ts";
import { formatNumber, parseForecastTime } from "@/feature/weather/weatherData.ts";

/** Width of one hour column in px — wide enough for "100%" plus breathing room. */
const COLUMN_WIDTH = 56;

/** Plot height in px. */
const CHART_HEIGHT = 112;

/** Half an hour in ms: each data point sits in the middle of its column. */
const HALF_HOUR_MS = 30 * 60_000;

/** Duration of the series entry animation in ms. */
const ANIMATION_MS = 450;

/** Precipitation amounts below this (mm) are noise and stay unlabelled. */
const PRECIPITATION_LABEL_MIN_MM = 0.1;

export interface SunEvent {
    kind: "sunrise" | "sunset";
    time: DateTime;
}

interface HourlyForecastChartProps {
    hourly: WeatherHourPoint[];
    metric: HourlyMetric;
    sunEvents: SunEvent[];
    now: DateTime;
    selectedTime: string | null;
    onSelect: (time: string) => void;
}

interface ChartPoint {
    t: number;
    time: string;
    value: number | null;
}

export function HourlyForecastChart({ hourly, metric, sunEvents, now, selectedTime, onSelect }: HourlyForecastChartProps) {
    const reduceMotion = useReducedMotion() ?? false;
    const width = hourly.length * COLUMN_WIDTH;

    const data = useMemo<ChartPoint[]>(
        () => hourly.map((hour) => ({
            t: parseForecastTime(hour.time).toMillis(),
            time: hour.time,
            value: metric.value(hour),
        })),
        [hourly, metric],
    );

    const start = data[0].t - HALF_HOUR_MS;
    const end = data[data.length - 1].t + HALF_HOUR_MS;
    const xPosition = (ms: number) => ((ms - start) / (end - start)) * width;
    const visibleSunEvents = sunEvents.filter((event) => {
        const ms = event.time.toMillis();
        return ms >= start && ms <= end;
    });
    const nowMs = now.toMillis();
    const isNowVisible = nowMs >= start && nowMs <= end;

    const chartConfig = { value: { label: metric.label, color: metric.color } } satisfies ChartConfig;

    return (
        <ScrollArea className="-mx-5 sm:-mx-6">
            <div className="w-max px-5 sm:px-6">
                <div className="relative" style={{ width }}>
                    {/* Column highlights sit behind labels and plot so "now" and the selection read as one column. */}
                    {hourly.map((hour, index) => {
                        const isNow = parseForecastTime(hour.time).hasSame(now, "hour");
                        const isSelected = hour.time === selectedTime;
                        if (!isNow && !isSelected) return null;
                        return (
                            <div
                                key={hour.time}
                                aria-hidden
                                className={cn(
                                    "pointer-events-none absolute inset-y-0 rounded-lg transition-colors duration-200",
                                    isSelected ? "bg-warning/10 ring-1 ring-inset ring-warning/30" : "bg-muted/60",
                                )}
                                style={{ left: index * COLUMN_WIDTH, width: COLUMN_WIDTH }}
                            />
                        );
                    })}

                    <div className="relative flex" role="group" aria-label={`${metric.label} pro Stunde`}>
                        {hourly.map((hour) => {
                            const time = parseForecastTime(hour.time);
                            const isNow = time.hasSame(now, "hour");
                            const isSelected = hour.time === selectedTime;
                            const value = metric.value(hour);
                            const Icon = getWeatherIcon(hour.icon);
                            return (
                                <button
                                    key={hour.time}
                                    type="button"
                                    onClick={() => onSelect(hour.time)}
                                    aria-pressed={isSelected}
                                    aria-label={`${isNow ? "Jetzt" : time.toFormat("HH:mm")} Uhr, ${hour.condition}${value !== null ? `, ${metric.formatLong(value)}` : ""}`}
                                    className="flex shrink-0 flex-col items-center gap-1.5 rounded-lg pb-1 pt-2 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                                    style={{ width: COLUMN_WIDTH }}
                                >
                                    <span className={cn("text-xs tabular-nums", isNow || isSelected ? "font-medium text-foreground" : "text-muted-foreground")}>
                                        {isNow ? "Jetzt" : time.toFormat("HH")}
                                    </span>
                                    <Icon className="size-5 text-warning" strokeWidth={1.75} aria-hidden />
                                    <span className="text-sm font-medium tabular-nums">
                                        {value !== null ? metric.format(value) : "–"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <ChartContainer config={chartConfig} className="relative aspect-auto w-full" style={{ height: CHART_HEIGHT }}>
                        <ComposedChart
                            data={data}
                            margin={{ top: 8, right: 0, bottom: 4, left: 0 }}
                            onClick={(state) => {
                                const point = state?.activePayload?.[0]?.payload as ChartPoint | undefined;
                                if (point) onSelect(point.time);
                            }}
                            className="cursor-pointer"
                        >
                            <XAxis dataKey="t" type="number" domain={[start, end]} hide />
                            <YAxis
                                hide
                                domain={metric.domain}
                                allowDataOverflow={false}
                            />
                            {visibleSunEvents.map((event) => (
                                <ReferenceLine
                                    key={event.kind + event.time.toISO()}
                                    x={event.time.toMillis()}
                                    stroke="hsl(var(--warning))"
                                    strokeOpacity={0.35}
                                    strokeDasharray="2 4"
                                />
                            ))}
                            {isNowVisible && (
                                <ReferenceLine x={nowMs} stroke="hsl(var(--foreground))" strokeOpacity={0.25} />
                            )}
                            <Tooltip
                                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                                content={({ active, payload }) => (
                                    <HourTooltip active={active} point={payload?.[0]?.payload as ChartPoint | undefined} hourly={hourly} metric={metric} />
                                )}
                            />
                            {metric.shape === "bar" ? (
                                <Bar
                                    dataKey="value"
                                    fill="var(--color-value)"
                                    fillOpacity={0.8}
                                    radius={[3, 3, 0, 0]}
                                    barSize={Math.round(COLUMN_WIDTH * 0.4)}
                                    isAnimationActive={!reduceMotion}
                                    animationDuration={ANIMATION_MS}
                                    animationEasing="ease-out"
                                />
                            ) : (
                                <Area
                                    dataKey="value"
                                    type="monotone"
                                    stroke="var(--color-value)"
                                    strokeWidth={2}
                                    fill="var(--color-value)"
                                    fillOpacity={0.08}
                                    baseValue="dataMin"
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                                    isAnimationActive={!reduceMotion}
                                    animationDuration={ANIMATION_MS}
                                    animationEasing="ease-out"
                                />
                            )}
                        </ComposedChart>
                    </ChartContainer>

                    {metric.key === "precipitation" && (
                        <div className="relative flex" aria-hidden>
                            {hourly.map((hour) => (
                                <span
                                    key={hour.time}
                                    className="shrink-0 text-center text-[11px] tabular-nums text-muted-foreground"
                                    style={{ width: COLUMN_WIDTH }}
                                >
                                    {hour.precipitationMm >= PRECIPITATION_LABEL_MIN_MM ? `${formatNumber(hour.precipitationMm, 1)} mm` : ""}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="relative h-6" aria-hidden={visibleSunEvents.length === 0}>
                        {visibleSunEvents.map((event) => {
                            const Icon = event.kind === "sunrise" ? Sunrise : Sunset;
                            return (
                                <span
                                    key={event.kind + event.time.toISO()}
                                    className="absolute top-1 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap text-[11px] tabular-nums text-warning"
                                    style={{ left: xPosition(event.time.toMillis()) }}
                                >
                                    <Icon className="size-3" aria-hidden />
                                    <span className="sr-only">{event.kind === "sunrise" ? "Sonnenaufgang" : "Sonnenuntergang"}</span>
                                    {event.time.toFormat("HH:mm")}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

interface HourTooltipProps {
    active?: boolean;
    point?: ChartPoint;
    hourly: WeatherHourPoint[];
    metric: HourlyMetric;
}

function HourTooltip({ active, point, hourly, metric }: HourTooltipProps) {
    if (!active || !point || point.value === null) return null;
    const hour = hourly.find((h) => h.time === point.time);
    if (!hour) return null;

    return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
            <p className="font-medium tabular-nums">{parseForecastTime(hour.time).toFormat("HH:mm")} Uhr · {hour.condition}</p>
            <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: metric.color }} aria-hidden />
                <span className="tabular-nums text-foreground">{metric.formatLong(point.value)}</span>
            </p>
            {metric.key === "precipitation" && hour.precipitationMm >= PRECIPITATION_LABEL_MIN_MM && (
                <p className="mt-0.5 pl-3.5 tabular-nums text-muted-foreground">{formatNumber(hour.precipitationMm, 1)} mm erwartet</p>
            )}
        </div>
    );
}
