import {useQuery} from "@tanstack/react-query";
import {fetchMetric} from "@/api/analytics/endpoints/overview.ts";
import {buildApiParams} from "@/api/utils.ts";

type PeriodTime = "current" | "previous";

interface GetMetricProps {
    parameter: string;
    limit: number;
    periodTime: PeriodTime;
    useFilters?: boolean;
}

interface GetMetricPaginationProps {
    parameter: string;
    limit: number;
    page: number,
    useFilters?: boolean;
}

export function usePaginatedMetric({
    parameter,
    limit = 10,
    page = 1,
    useFilters = true,
}: GetMetricPaginationProps) {
    const params = buildApiParams();
    const queryKey = [parameter, 1, limit, useFilters, 'Europe/Berlin'];

    return useQuery({
        queryKey,
        queryFn: async () => {
            const result = await fetchMetric(1, {
                ...params,
                parameter,
                limit,
                page
            });
            return { data: result.data };
        },
        staleTime: 60_000,
        placeholderData: (_, query: any) => {
            if (!query?.queryKey) return undefined;
            const prevQueryKey = query.queryKey as [string, string, string];
            const [, , prevSite] = prevQueryKey;

            if (prevSite === '1') {
                return query.state.data;
            }
            return undefined;
        },
        enabled: !!1,
    })
}

export function useMetric({
    parameter,
    limit = 1000,
    periodTime,
    useFilters = true,
}: GetMetricProps) {
    const params = buildApiParams();
    const queryKey = [parameter, 1, limit, useFilters, 'Europe/Berlin'];

    return useQuery({
        queryKey,
        queryFn: async () => {
            const result = await fetchMetric(1, {
                ...params,
                parameter,
                limit
            });
            return { data: result.data };
        },
        staleTime: 60_000,
        placeholderData: (_, query: any) => {
            if (!query?.queryKey) return undefined;
            const prevQueryKey = query.queryKey as [string, string, string];
            const [, , prevSite] = prevQueryKey;

            if (prevSite === '1') {
                return query.state.data;
            }
            return undefined;
        },
        enabled: !!1,
    })
}