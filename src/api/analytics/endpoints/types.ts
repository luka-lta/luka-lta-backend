import {Filter, FilterParameter} from "@/lib/filters.ts";

export interface CommonApiParams {
    startDate: string; // YYYY-MM-DD format (empty string for past-minutes mode)
    endDate: string; // YYYY-MM-DD format (empty string for past-minutes mode)
    timeZone: string; // IANA timezone string// Optional past-minutes mode params (when startDate/endDate are empty)
    pastMinutesStart?: number;
    pastMinutesEnd?: number;
    filters?: Filter[];
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SortParams {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface MetricParams extends CommonApiParams, PaginationParams {
    parameter: FilterParameter;
}

export function toQueryParams(params: CommonApiParams): Record<string, any> {
    // Use past-minutes mode if pastMinutesStart is provided
    if (params.pastMinutesStart !== undefined) {
        return {
            time_zone: params.timeZone,
            past_minutes_start: params.pastMinutesStart,
            past_minutes_end: params.pastMinutesEnd ?? 0,
            filters: params.filters?.length ? params.filters : undefined,
        };
    }

    // Default to date range mode
    return {
        start_date: params.startDate,
        end_date: params.endDate,
        time_zone: params.timeZone,
        filters: params.filters?.length ? params.filters : undefined,
    };
}

export function toMetricQueryParams(params: MetricParams): Record<string, any> {
    return {
        ...toQueryParams(params),
        parameter: params.parameter,
        limit: params.limit,
        page: params.page,
    };
}