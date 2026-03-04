import {buildApiParams} from "@/api/utils.ts";
import {useQuery} from "@tanstack/react-query";
import {fetchTrackedUsers, UsersResponse} from "@/api/analytics/endpoints/trackedUsers.ts";

export interface GetUsersOptions {
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: string;
    search?: string;
    searchField?: string;
}


export function useGetTrackedUsers(options: GetUsersOptions) {
    const { page, pageSize, sortBy, sortOrder, search, searchField } = options;
    const params = buildApiParams();

    return useQuery({
        queryKey: ["tracked-users", 1, page, pageSize, sortBy, sortOrder, search, searchField],
        queryFn: async () => {
            const result = await fetchTrackedUsers(1, {
                ...params,
                page,
                pageSize,
                sortBy,
/*
                sortOrder: sortOrder as "asc" | "desc",
*/
                sortOrder: "asc",
                search,
                searchField,
            });
            return {
                data: result.users as UsersResponse[],
                totalCount: result.totalCount,
/*                page: result.page,
                pageSize: result.pageSize,*/
            };
        },
        // Use default staleTime (0) for real-time data
        staleTime: 0,
        // Enable refetching when the window regains focus
        refetchOnWindowFocus: true,
        enabled: !!1,
    });
}