import {CommonApiParams, PaginationParams, SortParams, toQueryParams} from "@/api/analytics/endpoints/types.ts";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";

export type UsersResponse = {
    userId: string; // Device fingerprint
    country: string;
    region: string;
    city: string;
    language: string;
    browser: string;
    os: string;
    device: string;
    referrer: string;
    channel: string;
    pageviews: number;
    events: number;
    sessions: number;
    lastSeen: string;
    firstSeen: string;
};

export type UserInfo = {
    duration: number;
    sessions: number;
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
    screenHeight: number;
    screenWidth: number;
    lastSeen: string;
    firstSeen: string;
    pageviews: number;
    events: number;
    ip?: string;
};

export interface UsersParams extends CommonApiParams, PaginationParams, SortParams {
    pageSize?: number;
    identifiedOnly?: boolean;
    search?: string;
    searchField?: string;
}

export interface UsersListResponse {
    users: UsersResponse[];
    totalCount: number;
/*    page: number;
    pageSize: number;*/
}

export async function fetchTrackedUsers(
    site: string | number, params: UsersParams
): Promise<UsersListResponse> {
    const queryParams = {
        ...toQueryParams(params),
        page: params.page,
        page_size: params.pageSize ?? params.limit,
        sort_by: params.sortBy,
        sort_order: params.sortOrder,
        search: params.search || undefined,
        search_field: params.searchField || undefined,
    };

    const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);

    const response = await fetchWrapper.get(`/site/${site}/users/`, undefined, queryParams);
    return response.data;
}

export async function fetchUserInfo(site: string | number, userId: string): Promise<UserInfo> {
    const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);

    const response = await fetchWrapper.get(`/site/${site}/users/${encodeURIComponent(userId)}`);
    return response.data.user;
}

