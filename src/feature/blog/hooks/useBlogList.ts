import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FetchWrapper } from '@/lib/fetchWrapper'
import { blogListSchema } from '@/feature/blog/schema/BlogSchema'

export function useBlogList() {
    const [filterData, setFilterData] = useState<Record<string, any>>({})

    const queryData = useQuery({
        queryKey: ['blog', 'list', filterData],
        queryFn: async () => {
            const params = new URLSearchParams()

            for (const [key, value] of Object.entries(filterData)) {
                if (value !== undefined && value !== null && value !== 'undefined') {
                    params.set(key, String(value))
                }
            }

            const fw = new FetchWrapper(FetchWrapper.baseUrl)
            const response = await fw.get(`/blog?${params.toString()}`)
            return blogListSchema.parse(response.data)
        },
    })

    return [queryData, setFilterData] as const
}
