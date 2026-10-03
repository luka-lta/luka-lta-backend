import api from "@/api/axios.ts";
import {
    calendarEventsResultSchema,
    calendarSourceListSchema,
    calendarSourceResultSchema,
    calendarSummarySchema,
} from "@/api/calendar/schema.ts";

export async function fetchCalendarSummary() {
    const response = await api.get("/calendar");
    return calendarSummarySchema.parse(response.data.data);
}

export async function fetchCalendarEvents(from: string, to: string) {
    const response = await api.get("/calendar/events", { params: { from, to } });
    return calendarEventsResultSchema.parse(response.data.data);
}

export async function fetchCalendarSources() {
    const response = await api.get("/calendar/sources");
    return calendarSourceListSchema.parse(response.data.data).sources;
}

export async function createCalendarSource(data: { name: string; url: string; color?: string }) {
    const response = await api.post("/calendar/sources", data);
    return calendarSourceResultSchema.parse(response.data.data).source;
}

export async function deleteCalendarSource(id: number) {
    await api.delete(`/calendar/sources/${id}`);
}

export interface UpdateCalendarSourceData {
    name?: string;
    url?: string;
    color?: string;
    isEnabled?: boolean;
}

export async function updateCalendarSource(id: number, data: UpdateCalendarSourceData) {
    const response = await api.patch(`/calendar/sources/${id}`, data);
    return calendarSourceResultSchema.parse(response.data.data).source;
}
