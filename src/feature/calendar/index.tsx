import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useCalendarEvents, useCalendarSources } from "@/api/calendar/hooks.ts";
import { useCalendarMonth, useCalendarYear } from "@/components/kibo-ui/calendar/index.tsx";
import type { CalendarEvent, CalendarSource } from "@/api/calendar/schema.ts";
import type { CalendarViewMode } from "@/feature/calendar/types.ts";
import { getWeekDays, startOfWeek } from "@/feature/calendar/calendarGrid.ts";
import { CalendarNav } from "@/feature/calendar/components/CalendarNav.tsx";
import { CalendarSidebar } from "@/feature/calendar/components/CalendarSidebar.tsx";
import { MonthGrid } from "@/feature/calendar/components/MonthGrid.tsx";
import { TimeGridView } from "@/feature/calendar/components/TimeGridView.tsx";
import { AddSourceDialog } from "@/feature/calendar/components/AddSourceDialog.tsx";
import { EditSourceDialog } from "@/feature/calendar/components/EditSourceDialog.tsx";
import { EventDetailDialog } from "@/feature/calendar/components/EventDetailDialog.tsx";

function loadedRangeFor(date: DateTime): { from: DateTime; to: DateTime } {
    const monthStart = date.startOf("month");
    const monthEnd = date.endOf("month");
    return { from: startOfWeek(monthStart), to: startOfWeek(monthEnd).plus({ days: 6 }).endOf("day") };
}

function CalendarPage() {
    const [view, setView] = useState<CalendarViewMode>("month");
    const [selectedDate, setSelectedDate] = useState(() => DateTime.now());
    const [loadedRange, setLoadedRange] = useState(() => loadedRangeFor(DateTime.now()));
    const [addSourceOpen, setAddSourceOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<CalendarSource | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const [, setKiboMonth] = useCalendarMonth();
    const [, setKiboYear] = useCalendarYear();

    const sourcesQuery = useCalendarSources();
    const eventsQuery = useCalendarEvents(
        loadedRange.from.toUTC().toFormat("yyyy-MM-dd HH:mm:ss"),
        loadedRange.to.toUTC().toFormat("yyyy-MM-dd HH:mm:ss"),
        true,
    );

    // Re-sync the loaded fetch window only when navigation actually leaves it —
    // stepping a day/week back and forth within the same month reuses the cache.
    useEffect(() => {
        if (selectedDate < loadedRange.from || selectedDate > loadedRange.to) {
            setLoadedRange(loadedRangeFor(selectedDate));
        }
    }, [selectedDate, loadedRange]);

    function syncMonthView(date: DateTime) {
        setKiboMonth((date.month - 1) as Parameters<typeof setKiboMonth>[0]);
        setKiboYear(date.year);
    }

    function handleNavigate(direction: -1 | 1) {
        setSelectedDate((prev) => {
            const next =
                view === "month"
                    ? prev.plus({ months: direction })
                    : view === "week"
                        ? prev.plus({ weeks: direction })
                        : prev.plus({ days: direction });
            syncMonthView(next);
            return next;
        });
    }

    function handleToday() {
        const now = DateTime.now();
        setSelectedDate(now);
        syncMonthView(now);
    }

    function handleViewChange(next: CalendarViewMode) {
        setView(next);
        syncMonthView(selectedDate);
    }

    function handleSelectDay(date: Date) {
        const parsed = DateTime.fromJSDate(date);
        if (!parsed.isValid) return;
        setSelectedDate(parsed);
        setView("day");
    }

    const sources = sourcesQuery.data ?? [];
    const visibleEvents = (eventsQuery.data?.events ?? []).filter((event) => {
        const source = sources.find((s) => s.id === event.calendarId);
        return source ? source.isEnabled : true;
    });

    const header = (
        <PageHeader
            title="Kalender"
            description={`Heute ist ${DateTime.now().toFormat("cccc, d. LLLL")}. Termine sind nur lesbar und kommen aus deinen ICS-Kalendern.`}
            actions={
                <Button onClick={() => setAddSourceOpen(true)}>
                    <CalendarPlus />
                    Kalender hinzufügen
                </Button>
            }
        />
    );

    return (
        <PageContainer title="Kalender">
            {header}

            {eventsQuery.isError ? (
                <ErrorState
                    title="Termine konnten nicht geladen werden"
                    error={eventsQuery.error}
                    onRetry={() => eventsQuery.refetch()}
                />
            ) : (
                <>
                    <CalendarNav
                        view={view}
                        onViewChange={handleViewChange}
                        anchor={selectedDate}
                        onNavigate={handleNavigate}
                        onToday={handleToday}
                    />

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
                        <div
                            className="overflow-hidden rounded-xl border bg-card shadow-xs"
                            style={{ minHeight: view === "month" ? 600 : undefined }}
                        >
                            {eventsQuery.isPending ? (
                                <div className="space-y-2 p-4" aria-busy="true" aria-label="Wird geladen">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-[520px] w-full" />
                                </div>
                            ) : view === "month" ? (
                                <MonthGrid events={visibleEvents} onSelectEvent={setSelectedEvent} onSelectDay={handleSelectDay} />
                            ) : (
                                <TimeGridView
                                    days={view === "week" ? getWeekDays(selectedDate) : [selectedDate]}
                                    events={visibleEvents}
                                    onSelectEvent={setSelectedEvent}
                                />
                            )}
                        </div>

                        <CalendarSidebar
                            sources={sources}
                            onAddClick={() => setAddSourceOpen(true)}
                            onEditClick={setEditingSource}
                        />
                    </div>
                </>
            )}

            <AddSourceDialog open={addSourceOpen} onOpenChange={setAddSourceOpen} />
            <EditSourceDialog source={editingSource} onOpenChange={(open) => !open && setEditingSource(null)} />
            <EventDetailDialog event={selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)} />
        </PageContainer>
    );
}

export default CalendarPage;
