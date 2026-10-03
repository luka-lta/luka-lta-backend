/**
 * Fixed palette for calendars without an explicit color — assigned once at
 * creation time and stored, never re-randomized on render (a calendar's color
 * must stay stable across reloads).
 */
export const CALENDAR_COLOR_PALETTE = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#84cc16", // lime
];

export function pickNextCalendarColor(existingCount: number): string {
    return CALENDAR_COLOR_PALETTE[existingCount % CALENDAR_COLOR_PALETTE.length];
}
