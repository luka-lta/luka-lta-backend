import { DateTime } from "luxon";
import type { WeatherForecastDay, WeatherHourPoint } from "@/api/weather/schema.ts";

const COMPASS_POINTS = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];

/** 360° wind direction to an 8-point German compass label. */
export function formatWindDirection(degrees: number): string {
    const index = Math.round(degrees / 45) % 8;
    return COMPASS_POINTS[index];
}

/**
 * Open-Meteo's daily/hourly timestamps come back in the configured location's
 * local wall clock (no UTC offset) rather than the app's usual UTC-SQL
 * convention — parsed as-is, which is correct as long as the viewer is in the
 * same timezone as the configured weather location (true for a single-user
 * personal dashboard).
 */
export function parseForecastTime(value: string): DateTime {
    return DateTime.fromISO(value);
}

/** German weekday label, "Heute" for the current day. */
export function formatForecastWeekday(date: DateTime): string {
    if (date.hasSame(DateTime.now(), "day")) return "Heute";
    return date.setLocale("de").toFormat("cccc");
}

export function formatDaylightDuration(sunrise: string, sunset: string): string {
    const diff = parseForecastTime(sunset).diff(parseForecastTime(sunrise), ["hours", "minutes"]).toObject();
    const hours = Math.floor(diff.hours ?? 0);
    const minutes = Math.round(diff.minutes ?? 0);
    return `${hours}h ${minutes}m`;
}

/** Percent of the way from sunrise to sunset "now" is — clamped to [0, 1]; null outside that window. */
export function daylightProgress(sunrise: string, sunset: string): number | null {
    const now = DateTime.now();
    const start = parseForecastTime(sunrise);
    const end = parseForecastTime(sunset);
    if (now < start || now > end) return null;
    return now.diff(start).as("milliseconds") / end.diff(start).as("milliseconds");
}

export interface PrecipitationWarning {
    title: string;
    description: string;
}

/**
 * A short, honest heads-up derived from the hourly forecast we already have —
 * not an official meteorological warning (Open-Meteo's free forecast doesn't
 * provide those), just "the data already says this is likely". Only fires for
 * a clearly high probability, and only once for the first such window today.
 */
export function findPrecipitationWarning(hourly: WeatherHourPoint[]): PrecipitationWarning | null {
    const today = DateTime.now().startOf("day");
    const todayHours = hourly.filter((h) => parseForecastTime(h.time).hasSame(today, "day"));

    const threshold = 70;
    const startIndex = todayHours.findIndex((h) => h.precipitationProbabilityPercent >= threshold);
    if (startIndex === -1) return null;

    let endIndex = startIndex;
    while (
        endIndex + 1 < todayHours.length &&
        todayHours[endIndex + 1].precipitationProbabilityPercent >= threshold - 20
    ) {
        endIndex++;
    }

    const start = parseForecastTime(todayHours[startIndex].time);
    const end = parseForecastTime(todayHours[endIndex].time).plus({ hours: 1 });

    return {
        title: "Starker Regen erwartet",
        description: `Heute zwischen ${start.toFormat("HH:mm")} und ${end.toFormat("HH:mm")} Uhr`,
    };
}

/** Lowest/highest temperature across a set of forecast days — for scaling range bars consistently. */
export function temperatureBounds(days: WeatherForecastDay[]): { min: number; max: number } {
    if (days.length === 0) return { min: 0, max: 1 };
    const mins = days.map((d) => d.temperatureMinCelsius);
    const maxs = days.map((d) => d.temperatureMaxCelsius);
    return { min: Math.min(...mins), max: Math.max(...maxs) };
}
