import {CommonApiParams} from "@/api/analytics/endpoints/types.ts";

export function buildApiParams(): CommonApiParams {

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const format = (date: Date) => date.toISOString().split("T")[0];
    return {
        startDate: format(today),
        endDate: format(thirtyDaysAgo),
        timeZone: 'Europe/Berlin',
    };
}

export function truncateString(str: string, n = 50) {
    return str.length > n ? str.substring(0, n) + "..." : str;
}