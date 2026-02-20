import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {siteApiResult} from "@/feature/site-config/schema/SiteSchema.ts";

export function useSite() {
    const queryData = useQuery({
        queryKey: ['site', 'configuration'],
        queryFn: async () => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/site/1`);

            return siteApiResult.parse(response.data);
        },
        staleTime: 6000
    })

    return [queryData] as const;
}