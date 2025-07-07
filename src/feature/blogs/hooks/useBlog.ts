import {useQuery} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {blogDetailSchema} from "@/feature/blogs/schema/BlogSchema.ts";

export function useBlog(blogId: string) {
    const queryData = useQuery({
        queryKey: ['blog', 'detail', blogId],
        queryFn: async () => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            const response = await fetchWrapper.get(`/blog/${blogId}`);

            return blogDetailSchema.parse(response.data);
        }
    })

    return [queryData] as const;
}