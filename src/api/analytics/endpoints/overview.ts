// Metric response type
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {MetricParams, toMetricQueryParams} from "@/api/analytics/endpoints/types.ts";

export type MetricResponse = {
    value: string;
    title?: string;
    count: number;
    percentage: number;
    pageviews?: number;
    pageviewsPercentage?: number;
    timeOnPageSeconds?: number;
    bounceRate?: number;
};

export async function fetchMetric(
    site: string | number,
    params: MetricParams
): Promise<{data: MetricResponse[]; totalCount: number}> {
    const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);

    const response = await fetchWrapper.get('/site/' + site + '/metric', undefined, toMetricQueryParams(params))

    return response.data;
}