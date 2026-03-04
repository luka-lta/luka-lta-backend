import {CommonApiParams, PaginationParams, toQueryParams} from "@/api/analytics/endpoints/types.ts";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";

export type GetSessionsResponse = {
    sessionId: string;
    userId: string; // Device fingerprint
    country: string;
    region: string;
    city: string;
    language: string;
    device: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    screenWidth: number;
    screenHeight: number;
    referrer: string;
    channel: string;
    hostname: string;
    page_title: string;
    querystring: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmTerm: string;
    utmContent: string;
    sessionEnd: string;
    sessionStart: string;
    sessionDuration: number;
    entryPage: string;
    exitPage: string;
    pageviews: number;
    events: number;
    errors: number;
    outbound: number;
    buttonClicks: number;
    copies: number;
    formSubmits: number;
    inputChanges: number;
    ip: string;
    lat: number;
    lon: number;
}[];

export interface SessionDetails {
    sessionId: string;
    userId: string;
    country: string;
    region: string;
    city: string;
    language: string;
    device: string;
    browser: string;
    browserVersion: string;
    operatingSystem: string;
    operatingSystemVersion: string;
    screenWidth: number;
    screenHeight: number;
    referrer: string;
    channel: string;
    sessionEnd: string;
    sessionStart: string;
    sessionDuration: number;
    pageviews: number;
    events: number;
    entryPage: string;
    exitPage: string;
    ip: string;
}

// Session event props type
export interface SessionEventProps {
    [key: string]: unknown;
    // Error-specific props
    message?: string;
    stack?: string;
}

export interface SessionEvent {
    timestamp: string;
    pathname: string;
    hostname: string;
    urlParameters: string;
    pageTitle: string;
    referrer: string;
    type: string;
    eventName?: string;
    props?: SessionEventProps;
}

export interface SessionPageviewsAndEvents {
    session: SessionDetails;
    events: SessionEvent[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface SessionsParams extends CommonApiParams, PaginationParams {
    userId?: string;
}

export interface SessionDetailsParams {
    sessionId: string;
    limit?: number;
    offset?: number;
    minutes?: number;
}

export async function fetchSessions(
    site: string | number,
    params: SessionsParams
): Promise<GetSessionsResponse> {
    const queryParams = {
        ...toQueryParams(params),
        page: params.page,
        limit: params.limit,
        trackingUserId: params.userId,
    };

    const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);

    const response = await fetchWrapper.get(`/site/${site}/sessions`, undefined, queryParams);

    return response.data.sessions;
}

export async function fetchSession(
    site: string | number,
    params: SessionDetailsParams
): Promise<any> {
    const queryParams: Record<string, any> = {
        limit: params.limit,
        offset: params.offset,
    };

    if (params.minutes) {
        queryParams.minutes = params.minutes;
    }

    const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);

    return await fetchWrapper.get(`/site/${site}/sessions/${params.sessionId}`, undefined, queryParams);
}