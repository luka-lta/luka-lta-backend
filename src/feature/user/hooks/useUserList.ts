import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {userListSchema} from "@/feature/user/schema/UserSchema.ts";

export function useUserList() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['users', 'list', filterData],
        queryFn: async () => {
            const params = new URLSearchParams(filterData);

            for (const name of params.keys()) {
                if (params.get(name) === 'undefined') {
                    params.delete(name);
                }
            }

            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/user/?${params.toString()}`);

            return userListSchema.parse(response.data);
        }
    })

    return [queryData, setFilterData] as const;
}