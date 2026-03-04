import { Duration, DurationLikeObject } from "luxon";

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