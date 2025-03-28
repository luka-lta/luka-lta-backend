import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {summaryListSchema} from "@/feature/dashboard/schema/ClickSummarySchema.ts";

export function useClickSummary() {
    const queryData = useQuery({
        queryKey: ['summary', 'click', 'list'],
        queryFn: async () => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/click/summary/`);

            return summaryListSchema.parse(response.data);
        }
    })

    return [queryData] as const;
}