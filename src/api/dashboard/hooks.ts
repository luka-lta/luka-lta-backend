import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {fetchClickSummary, fetchClicksStats} from "@/api/dashboard/endpoints.ts";

export function useClickSummary() {
    const queryData = useQuery({
        queryKey: ['summary', 'click', 'list'],
        queryFn: fetchClickSummary,
        refetchInterval: 300000, // 5 Minuten in Millisekunden
        refetchIntervalInBackground: true, // Auch im Hintergrund aktualisieren
        staleTime: 300000, // Daten sind 5 Minuten aktuell
        refetchOnWindowFocus: true // Bei Tab-Wechsel aktualisieren
    })

    return [queryData] as const;
}

export function useClicks() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['clicks', 'list', filterData],
        queryFn: () => fetchClicksStats(filterData),
    })

    return [queryData, setFilterData] as const;
}
