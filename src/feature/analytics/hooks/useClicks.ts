import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {clicksListSchema} from "@/feature/analytics/schema/AnalyticsSchema.ts";

export function useClicks() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['clicks', 'list', filterData],
        queryFn: async () => {
            const params = new URLSearchParams(filterData);

            for (const name of params.keys()) {
                if (params.get(name) === 'undefined') {
                    params.delete(name);
                }
            }

            const date = new Date();
            date.setDate(date.getDate() - 30);

            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/click/?startDate=${date.toISOString().split('T')[0]}`);

            return clicksListSchema.parse(response.data);
        }
    })

    return [queryData, setFilterData] as const;
}