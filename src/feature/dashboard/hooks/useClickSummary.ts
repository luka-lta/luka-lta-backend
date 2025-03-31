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
        },
        refetchInterval: 300000, // 5 Minuten in Millisekunden
        refetchIntervalInBackground: true, // Auch im Hintergrund aktualisieren
        staleTime: 300000, // Daten sind 5 Minuten aktuell
        refetchOnWindowFocus: true // Bei Tab-Wechsel aktualisieren
    })

    return [queryData] as const;
}