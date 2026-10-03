import { DateTime } from "luxon";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekDays } from "@/feature/calendar/calendarGrid.ts";
import type { CalendarViewMode } from "@/feature/calendar/types.ts";

interface CalendarNavProps {
    view: CalendarViewMode;
    onViewChange: (view: CalendarViewMode) => void;
    anchor: DateTime;
    onNavigate: (direction: -1 | 1) => void;
    onToday: () => void;
}

function formatPeriodLabel(view: CalendarViewMode, anchor: DateTime): string {
    const de = anchor.setLocale("de");

    if (view === "month") return de.toFormat("LLLL yyyy");
    if (view === "day") return de.toFormat("cccc, d. MMMM");

    const days = getWeekDays(anchor);
    const start = days[0].setLocale("de");
    const end = days[6].setLocale("de");
    if (start.month === end.month) {
        return `${start.toFormat("d.")} – ${end.toFormat("d. MMMM yyyy")}`;
    }
    return `${start.toFormat("d. MMM")} – ${end.toFormat("d. MMM yyyy")}`;
}

export function CalendarNav({ view, onViewChange, anchor, onNavigate, onToday }: CalendarNavProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => onNavigate(-1)} aria-label="Zurück">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-40 text-center text-sm font-medium capitalize">
                    {formatPeriodLabel(view, anchor)}
                </span>
                <Button variant="ghost" size="icon" onClick={() => onNavigate(1)} aria-label="Vor">
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onToday} className="ml-2">
                    Heute
                </Button>
            </div>

            <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarViewMode)}>
                <TabsList className="h-9">
                    <TabsTrigger value="day">Tag</TabsTrigger>
                    <TabsTrigger value="week">Woche</TabsTrigger>
                    <TabsTrigger value="month">Monat</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
