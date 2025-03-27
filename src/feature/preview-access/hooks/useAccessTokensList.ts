import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {accessTokenListSchema} from "@/feature/preview-access/schema/PreviewAccessSchema.ts";

export function useAccessTokensList() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['access', 'tokens', 'list', filterData],
        queryFn: async () => {
            const params = new URLSearchParams(filterData);

            for (const name of params.keys()) {
                if (params.get(name) === 'undefined') {
                    params.delete(name);
                }
            }

            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/previewToken/?${params.toString()}`);

            return accessTokenListSchema.parse(response.data);
        }
    })

    return [queryData, setFilterData] as const;
}