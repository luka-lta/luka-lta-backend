import { DateTime, Duration, DurationLikeObject } from "luxon";

export const userLocale = typeof navigator !== "undefined" ? navigator.language : "en-US";
const resolved = new Intl.DateTimeFormat(userLocale, {
    hour: "numeric",
}).resolvedOptions();
export const hour12 = resolved.hour === "h12";

export function formatShortDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);

    if (mins > 0) {
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${secs}s`;
}

export function formatDuration(duration: number): string {
    // Prepare duration parts in seconds and optionally minutes.
    const units: Record<string, number> = {
        seconds: Math.round(duration % 60),
    };

    if (duration > 59) {
        units.minutes = Math.floor(duration / 60);
    }

    // Choose which units to show: only "seconds" or both "minutes" and "seconds".
    const keys: (keyof DurationLikeObject)[] = duration > 59 ? ["minutes", "seconds"] : ["seconds"];

    // Convert to Luxon duration object and format to human-readable string.
    const luxonDuration = Duration.fromObject(units)
        .shiftTo(...keys)
        .normalize();

    return luxonDuration.toHuman({
        listStyle: "narrow",
        unitDisplay: "short",
    });
}

// The API returns SQL-style ("yyyy-MM-dd HH:mm:ss") timestamps with no zone marker.
// They're UTC on the wire, so parse as UTC and convert to local for display —
// otherwise relative times ("2 hours ago" for something just created) come out wrong.
function parseTimestamp(ts: string): DateTime {
    return DateTime.fromSQL(ts, {zone: "utc"}).setZone("local");
}

export function formatAbs(ts: string): string {
    const date = parseTimestamp(ts);
    return date.isValid ? date.toFormat("dd.MM.yyyy HH:mm") : ts;
}

export function formatAbsFull(ts: string): string {
    const date = parseTimestamp(ts);
    return date.isValid ? date.toFormat("dd.MM.yyyy HH:mm:ss") : ts;
}

export function formatRel(ts: string): string {
    const date = parseTimestamp(ts);
    return date.isValid ? (date.toRelative() ?? ts) : ts;
}

/** Current time as a SQL-style ("yyyy-MM-dd HH:mm:ss") UTC timestamp, matching what the API returns. */
export function toSqlUtcNow(): string {
    return DateTime.utc().toFormat("yyyy-MM-dd HH:mm:ss");
}