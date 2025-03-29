import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {selfUserListSchema} from "@/feature/SelfOverview/schema/SelfUserSchema.tsx";

export function useSelfUser() {

    const queryData = useQuery({
        queryKey: ['self', 'user'],
        queryFn: async () => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/self/`);

            return selfUserListSchema.parse(response.data);
        }
    })

    return [queryData] as const;
}