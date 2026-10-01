import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {fetchClicksOverview} from "@/api/clicks/endpoints.ts";

export function useClicksOverview() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['clicks', 'overview', filterData],
        queryFn: () => fetchClicksOverview(filterData),
    });

    return [queryData, setFilterData] as const;
}
