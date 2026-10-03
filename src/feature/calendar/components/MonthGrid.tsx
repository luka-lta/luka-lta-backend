import {
    CalendarBody,
    CalendarHeader,
    CalendarProvider,
    type Feature,
} from "@/components/kibo-ui/calendar/index.tsx";
import type { CalendarEvent } from "@/api/calendar/schema.ts";
import { parseEventTime } from "@/feature/calendar/calendarGrid.ts";
import { EventChip } from "@/feature/calendar/components/EventChip.tsx";

interface MonthGridProps {
    events: CalendarEvent[];
    onSelectEvent: (event: CalendarEvent) => void;
    onSelectDay: (date: Date) => void;
}

export function MonthGrid({ events, onSelectEvent, onSelectDay }: MonthGridProps) {
    const features: Feature[] = events.map((event) => ({
        id: event.id,
        name: event.title,
        startAt: parseEventTime(event.startsAt).toJSDate(),
        endAt: parseEventTime(event.endsAt).toJSDate(),
        status: {
            id: String(event.calendarId),
            name: event.calendar,
            color: event.color ?? "#64748b",
        },
    }));

    const eventsById = new Map(events.map((e) => [e.id, e]));

    return (
        <CalendarProvider className="h-full" locale="de-DE" startDay={1}>
            <CalendarHeader />
            <CalendarBody features={features} onDayClick={onSelectDay}>
                {({ feature }) => {
                    const event = eventsById.get(feature.id);
                    if (!event) return null;
                    return <EventChip key={feature.id} event={event} onClick={onSelectEvent} />;
                }}
            </CalendarBody>
        </CalendarProvider>
    );
}
