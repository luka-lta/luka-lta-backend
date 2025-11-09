import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {statisticListSchema} from "@/feature/dashboard/schema/statistic-schema.ts";

export function useStatistics(type: string) {

    const queryData = useQuery({
        queryKey: [type, 'statistics'],
        queryFn: async () => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/statistics/?statistic=${type}`);

            return statisticListSchema.parse(response.data);
        }
    })

    return [queryData] as const;
}