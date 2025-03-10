import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {apiKeyListSchema} from "@/feature/apiKey/schema/ApiKeySchema.ts";

export function useApiKeyList() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['apikey', 'list', filterData],
        queryFn: async () => {
            const params = new URLSearchParams(filterData);

            for (const name of params.keys()) {
                if (params.get(name) === 'undefined') {
                    params.delete(name);
                }
            }

            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/key/?${params.toString()}`);

            console.log(response.data)

            return apiKeyListSchema.parse(response.data);
        }
    })

    return [queryData, setFilterData] as const;
}