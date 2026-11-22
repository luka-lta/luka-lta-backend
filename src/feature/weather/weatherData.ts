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

/** Formats a number in German notation, e.g. 4.25 → "4,3". */
export function formatNumber(value: number, maximumFractionDigits = 0): string {
    return value.toLocaleString("de-DE", { maximumFractionDigits });
}

/** Rounded temperature with degree sign; avoids the "-0°" a float like -0.2 would produce. */
export function formatTemperature(celsius: number): string {
    const rounded = Math.round(celsius);
    return `${rounded === 0 ? 0 : rounded}°`;
}

/** Meters from which visibility is shown in kilometers. */
const VISIBILITY_KM_THRESHOLD_METERS = 1000;

export function formatVisibility(meters: number): string {
    if (meters < VISIBILITY_KM_THRESHOLD_METERS) return `${formatNumber(meters)} m`;
    return `${formatNumber(meters / VISIBILITY_KM_THRESHOLD_METERS, 1)} km`;
}

/** Forecast hour covering "now" — falls back to the first hour if the forecast starts later. */
export function findCurrentHour(hourly: WeatherHourPoint[]): WeatherHourPoint | null {
    const now = DateTime.now();
    return hourly.find((h) => parseForecastTime(h.time).hasSame(now, "hour")) ?? hourly[0] ?? null;
}

/** Forecast hours that belong to the given calendar day. */
export function hoursOfDay(hourly: WeatherHourPoint[], date: DateTime): WeatherHourPoint[] {
    return hourly.filter((h) => parseForecastTime(h.time).hasSame(date, "day"));
}

export interface ScaleLevel {
    /** Lower bound of the band (inclusive). */
    from: number;
    label: string;
}

/** WHO UV index bands. */
export const UV_LEVELS: ScaleLevel[] = [
    { from: 0, label: "Niedrig" },
    { from: 3, label: "Mäßig" },
    { from: 6, label: "Hoch" },
    { from: 8, label: "Sehr hoch" },
    { from: 11, label: "Extrem" },
];

/** European Air Quality Index bands (EEA). */
export const AQI_LEVELS: ScaleLevel[] = [
    { from: 0, label: "Gut" },
    { from: 20, label: "Ordentlich" },
    { from: 40, label: "Mäßig" },
    { from: 60, label: "Schlecht" },
    { from: 80, label: "Sehr schlecht" },
    { from: 100, label: "Extrem schlecht" },
];

/** Index of the band a value falls into. */
export function levelIndex(levels: ScaleLevel[], value: number): number {
    let index = 0;
    levels.forEach((level, i) => {
        if (value >= level.from) index = i;
    });
    return index;
}

/** Sun events of a day as DateTimes, null if the API left them empty. */
export function sunTimes(day: WeatherForecastDay): { sunrise: DateTime; sunset: DateTime } | null {
    const sunrise = parseForecastTime(day.sunrise);
    const sunset = parseForecastTime(day.sunset);
    if (!sunrise.isValid || !sunset.isValid) return null;
    return { sunrise, sunset };
}
