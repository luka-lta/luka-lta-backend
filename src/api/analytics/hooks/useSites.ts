import {useQuery} from "@tanstack/react-query";
import {fetchSite} from "@/api/analytics/endpoints/sites.ts";

export function useGetSite() {
    return useQuery({
        queryKey: ["get-site", 1],
        queryFn: async () => {
            return await fetchSite();
        },
        staleTime: 60000,
        enabled: !!1,
    });
}