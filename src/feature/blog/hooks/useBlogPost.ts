import { useQuery } from '@tanstack/react-query'
import { FetchWrapper } from '@/lib/fetchWrapper'
import { BlogPostSchema } from '@/feature/blog/schema/BlogSchema'
import { z } from 'zod'

const blogPostResponseSchema = z.object({ post: BlogPostSchema })

export function useBlogPost(blogId: string) {
    return useQuery({
        queryKey: ['blog', 'detail', blogId],
        queryFn: async () => {
            const fw = new FetchWrapper(FetchWrapper.baseUrl)
            const response = await fw.get(`/blog/${blogId}`)
            return blogPostResponseSchema.parse(response.data).post
        },
        enabled: !!blogId,
    })
}
