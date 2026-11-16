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
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onToday}>
                    Heute
                </Button>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => onNavigate(-1)} aria-label="Vorheriger Zeitraum">
                        <ChevronLeft />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onNavigate(1)} aria-label="Nächster Zeitraum">
                        <ChevronRight />
                    </Button>
                </div>
                <h2 className="text-base font-semibold capitalize" aria-live="polite">
                    {formatPeriodLabel(view, anchor)}
                </h2>
            </div>

            <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarViewMode)}>
                <TabsList aria-label="Ansicht">
                    <TabsTrigger value="day">Tag</TabsTrigger>
                    <TabsTrigger value="week">Woche</TabsTrigger>
                    <TabsTrigger value="month">Monat</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
