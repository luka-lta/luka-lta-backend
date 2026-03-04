import {useQuery} from "@tanstack/react-query";
import {fetchUserInfo} from "@/api/analytics/endpoints/trackedUsers.ts";

export function useUserInfo(siteId: number, userId: string) {
    return useQuery({
        queryKey: ["user-info", userId, siteId],
        queryFn: async () => {
            return await fetchUserInfo(siteId, userId);
        },
        enabled: !!siteId && !!userId,
    });
}
