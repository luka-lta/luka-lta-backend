import { z } from "zod";

export const CalendarEventSchema = z.object({
    id: z.string(),
    calendarId: z.number(),
    title: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    durationMinutes: z.number(),
    isAllDay: z.boolean(),
    location: z.string().nullable(),
    description: z.string().nullable(),
    attendees: z.array(z.string()),
    url: z.string().nullable(),
    calendar: z.string(),
    color: z.string().nullable(),
});

export const calendarStatusSchema = z.enum(["ok", "not_configured"]);

export const calendarSummarySchema = z.object({
    status: calendarStatusSchema,
    events: z.array(CalendarEventSchema),
});

export const calendarEventsResultSchema = z.object({
    status: calendarStatusSchema,
    events: z.array(CalendarEventSchema),
});

export const CalendarSourceSchema = z.object({
    id: z.number(),
    type: z.string(),
    name: z.string(),
    url: z.string(),
    color: z.string().nullable(),
    isEnabled: z.boolean(),
});

export const calendarSourceListSchema = z.object({
    sources: z.array(CalendarSourceSchema),
});

export const calendarSourceResultSchema = z.object({
    source: CalendarSourceSchema,
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type CalendarStatus = z.infer<typeof calendarStatusSchema>;
export type CalendarSummary = z.infer<typeof calendarSummarySchema>;
export type CalendarSource = z.infer<typeof CalendarSourceSchema>;
