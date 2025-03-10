import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {linkDetailSchema} from "@/feature/linktree/childPages/detail/schema/LinkDetailSchema.ts";

export function useLinkDetail(linkId: number) {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['linktree', 'detail', linkId, filterData],
        queryFn: async () => {
            const params = new URLSearchParams(filterData);

            for (const name of params.keys()) {
                if (params.get(name) === 'undefined') {
                    params.delete(name);
                }
            }

            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/linkCollection/${linkId}?${params.toString()}`);

            return linkDetailSchema.parse(response.data);
        }
    })

    return [queryData, setFilterData] as const;
}