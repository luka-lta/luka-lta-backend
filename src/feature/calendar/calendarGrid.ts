import { DateTime } from "luxon";
import type { CalendarEvent } from "@/api/calendar/schema.ts";
import { parseEventTime } from "@/feature/dashboard/widgets/calendarData.ts";

export { parseEventTime };

/** Monday of the week containing `date` (ISO weekday: 1 = Monday). */
export function startOfWeek(date: DateTime): DateTime {
    return date.startOf("day").minus({ days: date.weekday - 1 });
}

/** The 7 days (Mon–Sun) of the week containing `anchor`. */
export function getWeekDays(anchor: DateTime): DateTime[] {
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => start.plus({ days: i }));
}

export function eventsOnDay(events: CalendarEvent[], day: DateTime): CalendarEvent[] {
    return events.filter((e) => {
        const start = parseEventTime(e.startsAt);
        const end = parseEventTime(e.endsAt);
        return start < day.endOf("day") && end > day.startOf("day");
    });
}

export interface PositionedEvent {
    event: CalendarEvent;
    /** Percent from the top of the day column (0–100). */
    top: number;
    /** Percent height of the day column (0–100). */
    height: number;
    /** Column index and count for side-by-side overlap layout. */
    column: number;
    columns: number;
}

/**
 * Positions a day's timed (non-all-day) events within a 24h column as top/height
 * percentages, and packs overlapping events into side-by-side columns using a
 * simple greedy interval-graph coloring — good enough for a personal calendar's
 * typical handful of same-time events, not a full constraint solver.
 */
export function layoutDayEvents(events: CalendarEvent[], day: DateTime): PositionedEvent[] {
    const timed = eventsOnDay(events, day)
        .filter((e) => !e.isAllDay)
        .map((event) => {
            const start = parseEventTime(event.startsAt);
            const end = parseEventTime(event.endsAt);
            const dayStart = day.startOf("day");
            const clampedStart = start < dayStart ? dayStart : start;
            const clampedEnd = end > day.endOf("day") ? day.endOf("day") : end;
            const top = (clampedStart.diff(dayStart, "minutes").minutes / 1440) * 100;
            const height = Math.max((clampedEnd.diff(clampedStart, "minutes").minutes / 1440) * 100, 2);
            return { event, start: clampedStart, end: clampedEnd, top, height };
        })
        .sort((a, b) => a.start.toMillis() - b.start.toMillis());

    const columnEnds: DateTime[] = [];
    const assigned = timed.map((item) => {
        let column = columnEnds.findIndex((end) => end <= item.start);
        if (column === -1) {
            column = columnEnds.length;
            columnEnds.push(item.end);
        } else {
            columnEnds[column] = item.end;
        }
        return { ...item, column };
    });

    const columns = Math.max(columnEnds.length, 1);

    return assigned.map(({ event, top, height, column }) => ({ event, top, height, column, columns }));
}

export function allDayEventsOnDay(events: CalendarEvent[], day: DateTime): CalendarEvent[] {
    return eventsOnDay(events, day).filter((e) => e.isAllDay);
}
