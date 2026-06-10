import { useQuery } from '@tanstack/react-query'
import { FetchWrapper } from '@/lib/fetchWrapper'
import { tagListSchema } from '@/feature/blog/schema/BlogSchema'

export function useBlogTags() {
    return useQuery({
        queryKey: ['blog', 'tags'],
        queryFn: async () => {
            const fw = new FetchWrapper(FetchWrapper.baseUrl)
            const response = await fw.get('/blog/tags')
            return tagListSchema.parse(response.data)
        },
    })
}
