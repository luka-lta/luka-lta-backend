import {buildApiParams} from "@/api/utils.ts";
import {useInfiniteQuery, useQuery} from "@tanstack/react-query";
import {
    fetchSession,
    fetchSessions,
    GetSessionsResponse,
    SessionPageviewsAndEvents
} from "@/api/analytics/endpoints/sessions.ts";

export function useGetSessions({
                                   userId,
                                   page = 1,
                                   limit = 100,
                               }: {
    userId?: string;
    page?: number;
    limit?: number;
}) {
    // When filtering by userId, we fetch all sessions for that user (no time filter)
    // Otherwise use buildApiParams which handles past-minutes mode
    const params =  buildApiParams();

    return useQuery({
        queryKey: ["sessions", 1, userId, page, limit],
        queryFn: async  () => {
            const result = await fetchSessions(1, {
                ...params,
                page,
                limit,
                userId,
            });
            return {
                data: result as GetSessionsResponse
            }
        },
        staleTime: Infinity,
    });
}

export function useGetSessionDetailsInfinite(sessionId: string | null) {
    return useInfiniteQuery({
        queryKey: ["session-details-infinite", sessionId],
        queryFn: async ({ pageParam = 0 }) => {
            if (!sessionId) throw new Error("Session ID is required");

            const result = await fetchSession(1, {
                sessionId,
                limit: 100,
                offset: pageParam,
            });

            // Entpacke direkt das innere 'data'
            return result.data.data as SessionPageviewsAndEvents;
        },
        initialPageParam: 0,
        getNextPageParam: lastPage => {
            if (lastPage.pagination.hasMore) {
                return lastPage.pagination.offset + lastPage.pagination.limit;
            }
            return undefined;
        },
        enabled: !!sessionId,
        staleTime: Infinity,
    });
}