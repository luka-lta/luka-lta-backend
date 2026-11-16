import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import { CloudRain, Info } from "lucide-react";
import { WeatherCard } from "@/feature/dashboard/widgets/WeatherCard.tsx";
import { CalendarCard } from "@/feature/dashboard/widgets/CalendarCard.tsx";
import { buildEventWeatherHint, getCurrentEvent, getUpcomingEvents } from "@/feature/dashboard/widgets/calendarData.ts";
import { useCalendarSummary } from "@/api/calendar/hooks.ts";
import { useWeatherDetail } from "@/api/weather/hooks.ts";
import { cn } from "@/lib/utils.ts";

export function DayOverviewSection() {
    const navigate = useNavigate();

    const calendarSummary = useCalendarSummary();
    const weatherDetail = useWeatherDetail(true);

    const now = DateTime.now();
    const events = calendarSummary.data?.events ?? [];
    const relevantEvent = getCurrentEvent(events, now) ?? getUpcomingEvents(events, now)[0] ?? null;
    const hint = buildEventWeatherHint(relevantEvent, weatherDetail.data?.hourly ?? []);
    const hintIsWarning = hint?.includes("Regenwahrscheinlichkeit") ?? false;

    return (
        <div className="space-y-3">
            <div className="grid gap-4 lg:grid-cols-2">
                <CalendarCard onOpenDetail={() => navigate("/dashboard/calendar")} />
                <WeatherCard onOpenDetail={() => navigate("/dashboard/weather")} />
            </div>

            {hint && (
                <div
                    className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                        hintIsWarning ? "border-warning/30 bg-warning/5 text-foreground" : "bg-muted/40 text-muted-foreground",
                    )}
                >
                    {hintIsWarning ? <CloudRain className="size-4 shrink-0 text-warning" aria-hidden /> : <Info className="size-4 shrink-0" aria-hidden />}
                    {hint}
                </div>
            )}
        </div>
    );
}
