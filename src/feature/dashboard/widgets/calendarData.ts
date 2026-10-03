import { DateTime } from "luxon";
import type { CalendarEvent } from "@/api/calendar/schema.ts";
import type { WeatherHourPoint } from "@/api/weather/schema.ts";

/** Event start/end come back as SQL-style UTC timestamps, like everywhere else in the app. */
export function parseEventTime(ts: string): DateTime {
    return DateTime.fromSQL(ts, { zone: "utc" }).setZone("local");
}

export function getCurrentEvent(events: CalendarEvent[], now: DateTime): CalendarEvent | null {
    return (
        events.find((e) => {
            if (e.isAllDay) return false;
            const start = parseEventTime(e.startsAt);
            const end = parseEventTime(e.endsAt);
            return now >= start && now < end;
        }) ?? null
    );
}

export function getUpcomingEvents(events: CalendarEvent[], now: DateTime): CalendarEvent[] {
    return events
        .filter((e) => !e.isAllDay && parseEventTime(e.startsAt) > now)
        .sort((a, b) => parseEventTime(a.startsAt).toMillis() - parseEventTime(b.startsAt).toMillis());
}

export function getPastEvents(events: CalendarEvent[], now: DateTime): CalendarEvent[] {
    return events
        .filter((e) => !e.isAllDay && parseEventTime(e.endsAt) <= now)
        .sort((a, b) => parseEventTime(a.startsAt).toMillis() - parseEventTime(b.startsAt).toMillis());
}

/** Two timed events whose [start, end) ranges intersect. */
export function findOverlaps(events: CalendarEvent[]): [CalendarEvent, CalendarEvent][] {
    const timed = events.filter((e) => !e.isAllDay);
    const overlaps: [CalendarEvent, CalendarEvent][] = [];

    for (let i = 0; i < timed.length; i++) {
        for (let j = i + 1; j < timed.length; j++) {
            const aStart = parseEventTime(timed[i].startsAt);
            const aEnd = parseEventTime(timed[i].endsAt);
            const bStart = parseEventTime(timed[j].startsAt);
            const bEnd = parseEventTime(timed[j].endsAt);
            if (aStart < bEnd && bStart < aEnd) {
                overlaps.push([timed[i], timed[j]]);
            }
        }
    }

    return overlaps;
}

export function formatCountdown(target: DateTime, now: DateTime): string {
    const totalMinutes = Math.max(0, Math.round(target.diff(now, "minutes").minutes));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
}

/**
 * Open-Meteo's hourly points come back in the configured location's local wall
 * clock (no UTC offset) rather than the app's usual UTC-SQL convention — parsed
 * as-is, which is correct as long as the viewer is in the same timezone as the
 * configured weather location (true for a single-user personal dashboard).
 */
function parseHourlyTime(time: string): DateTime {
    return DateTime.fromISO(time);
}

/**
 * A short, factual weather-for-this-event hint — only for the clearly-good or
 * clearly-bad cases. Silent in between rather than hedging with a vague
 * percentage nobody acts on.
 */
export function buildEventWeatherHint(event: CalendarEvent | null, hourly: WeatherHourPoint[]): string | null {
    if (event === null || event.isAllDay || hourly.length === 0) return null;

    const eventStart = parseEventTime(event.startsAt);
    const closest = hourly.reduce((closest, point) => {
        const diff = Math.abs(parseHourlyTime(point.time).diff(eventStart, "minutes").minutes);
        const closestDiff = Math.abs(parseHourlyTime(closest.time).diff(eventStart, "minutes").minutes);
        return diff < closestDiff ? point : closest;
    });

    const time = eventStart.toFormat("HH:mm");

    if (closest.precipitationProbabilityPercent >= 50) {
        return `Regenwahrscheinlichkeit ${closest.precipitationProbabilityPercent}% zum Termin um ${time} — zusätzliche Fahrzeit einplanen.`;
    }

    if (closest.precipitationProbabilityPercent <= 20) {
        return `Für den Termin um ${time} ist aktuell kein Regen zu erwarten.`;
    }

    return null;
}
