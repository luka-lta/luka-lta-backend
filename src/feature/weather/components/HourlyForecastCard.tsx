import { DateTime } from "luxon";
import { Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";
import type { WeatherHourPoint } from "@/api/weather/schema.ts";
import { getWeatherIcon } from "@/feature/dashboard/widgets/weatherIcons.ts";
import { parseForecastTime } from "@/feature/weather/weatherData.ts";

const COLUMN_WIDTH = 52;
const ACCENT = "#f59e0b";

interface HourlyForecastCardProps {
    hourly: WeatherHourPoint[];
}

export function HourlyForecastCard({ hourly }: HourlyForecastCardProps) {
    if (hourly.length === 0) return null;

    const now = DateTime.now();
    const chartWidth = hourly.length * COLUMN_WIDTH;
    const chartData = hourly.map((h) => ({ temp: h.temperatureCelsius }));

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Heute · Stündlich</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div style={{ width: chartWidth, minWidth: "100%" }}>
                        <div className="flex">
                            {hourly.map((hour) => {
                                const time = parseForecastTime(hour.time);
                                const isNow = time.hasSame(now, "hour");
                                const Icon = getWeatherIcon(hour.icon);
                                return (
                                    <div
                                        key={hour.time}
                                        className="shrink-0 flex flex-col items-center gap-1 py-1 rounded-md"
                                        style={{ width: COLUMN_WIDTH }}
                                    >
                                        <span className={cn("text-xs", isNow ? "font-semibold text-foreground" : "text-muted-foreground")}>
                                            {isNow ? "Jetzt" : time.toFormat("HH:mm")}
                                        </span>
                                        <Icon className="h-5 w-5 text-amber-500" />
                                        <span className="text-sm font-medium tabular-nums">
                                            {Math.round(hour.temperatureCelsius)}°
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="my-1">
                            <AreaChart width={chartWidth} height={36} data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                                <Area
                                    type="monotone"
                                    dataKey="temp"
                                    stroke={ACCENT}
                                    strokeWidth={1.5}
                                    fill={ACCENT}
                                    fillOpacity={0.12}
                                    isAnimationActive={false}
                                    dot={false}
                                />
                            </AreaChart>
                        </div>

                        <div className="flex">
                            {hourly.map((hour) => (
                                <div key={hour.time} className="shrink-0 flex flex-col items-center gap-0.5" style={{ width: COLUMN_WIDTH }}>
                                    <div className="h-4 w-1.5 rounded-full bg-sky-500/15 overflow-hidden flex items-end">
                                        <div
                                            className="w-full rounded-full bg-sky-500"
                                            style={{ height: `${Math.max(hour.precipitationProbabilityPercent, 4)}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] text-sky-500 tabular-nums">
                                        {hour.precipitationProbabilityPercent}%
                                    </span>
                                    {hour.precipitationMm >= 0.1 && (
                                        <span className="text-[10px] text-muted-foreground tabular-nums">
                                            {hour.precipitationMm.toFixed(1)}mm
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
