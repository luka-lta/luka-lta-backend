import api from "@/api/axios.ts";
import {summaryListSchema} from "@/feature/dashboard/schema/ClickSummarySchema.ts";
import {clicksListSchema} from "@/feature/dashboard/schema/AnalyticsSchema.ts";

export async function fetchClickSummary() {
    const response = await api.get(`/click/summary/`);
    return summaryListSchema.parse(response.data.data);
}

export async function fetchClicksStats(filterData: Record<string, string>) {
    const params = new URLSearchParams(filterData);

    for (const name of params.keys()) {
        if (params.get(name) === 'undefined') {
            params.delete(name);
        }
    }

    const date = new Date();
    date.setDate(date.getDate() - 92);

    const response = await api.get(`/click/stats?startDate=${date.toISOString().split('T')[0]}`);
    return clicksListSchema.parse(response.data.data);
}
