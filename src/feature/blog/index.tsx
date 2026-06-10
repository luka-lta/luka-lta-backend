import { useBlogList } from '@/feature/blog/hooks/useBlogList'
import { useSetPageTitle } from '@/hooks/useSetPageTitle'
import { Main } from '@/components/layout/main'
import BlogProvider from '@/feature/blog/context/blog-context'
import BlogTable from '@/feature/blog/components/BlogTable'
import BlogDialogs from '@/feature/blog/components/BlogDialogs'
import {ErrorState} from '@/components/error-state'

function Blog() {
    const [blogList, setFilterData] = useBlogList()
    useSetPageTitle('Backend - Blog')

    if (blogList.error) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Blog Posts</h2>
                <ErrorState
                    title="Failed to load blog posts"
                    message={blogList.error.message}
                    refetch={blogList.refetch}
                />
            </div>
        )
    }

    return (
        <Main>
            <BlogProvider>
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
                        <p className="text-muted-foreground">Manage your blog posts here.</p>
                    </div>
                </div>

                <BlogTable
                    posts={blogList.data?.posts ?? []}
                    maxPages={blogList.data?.totalPages}
                    loading={blogList.isPending}
                    setFilterData={setFilterData}
                />

                <BlogDialogs />
            </BlogProvider>
        </Main>
    )
}

export default Blog
