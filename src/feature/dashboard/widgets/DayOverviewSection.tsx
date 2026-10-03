import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import { CloudRain, Info } from "lucide-react";
import { WeatherCard } from "@/feature/dashboard/widgets/WeatherCard.tsx";
import { CalendarCard } from "@/feature/dashboard/widgets/CalendarCard.tsx";
import { buildEventWeatherHint, getCurrentEvent, getUpcomingEvents } from "@/feature/dashboard/widgets/calendarData.ts";
import { useCalendarSummary } from "@/api/calendar/hooks.ts";
import { useWeatherDetail } from "@/api/weather/hooks.ts";

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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <CalendarCard onOpenDetail={() => navigate("/dashboard/calendar")} />
                <WeatherCard onOpenDetail={() => navigate("/dashboard/weather")} />
            </div>

            {hint && (
                <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${hintIsWarning ? "border-amber-500/30 bg-amber-500/5 text-amber-600" : "border-border bg-muted/30 text-muted-foreground"}`}>
                    {hintIsWarning ? <CloudRain className="h-4 w-4 shrink-0" /> : <Info className="h-4 w-4 shrink-0" />}
                    {hint}
                </div>
            )}
        </div>
    );
}
