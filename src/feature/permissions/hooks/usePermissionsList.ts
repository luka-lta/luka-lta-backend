import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {permissionListSchema} from "@/feature/permissions/schema/PermissionsSchema.ts";

export function usePermissionsList() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['permissions', 'list', filterData],
        queryFn: async () => {
            const params = new URLSearchParams(filterData);

            for (const name of params.keys()) {
                if (params.get(name) === 'undefined') {
                    params.delete(name);
                }
            }

            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/permissions/?${params.toString()}`);

            return permissionListSchema.parse(response.data);
        }
    })

    return [queryData, setFilterData] as const;
}