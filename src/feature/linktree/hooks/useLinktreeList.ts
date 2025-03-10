import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {linkListSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";

export function useLinktreeList() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['linktree', 'list', filterData],
        queryFn: async () => {
            const params = new URLSearchParams(filterData);

            for (const name of params.keys()) {
                if (params.get(name) === 'undefined') {
                    params.delete(name);
                }
            }

            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/linkCollection/?${params.toString()}`);

            return linkListSchema.parse(response.data);
        }
    })

    return [queryData, setFilterData] as const;
}