import { useBlogList } from '@/api/blog/hooks.ts'
import { useSetPageTitle } from '@/hooks/useSetPageTitle'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlogProvider from '@/feature/blog/context/blog-context'
import BlogTable from '@/feature/blog/components/BlogTable'
import BlogTagsTable from '@/feature/blog/components/BlogTagsTable'
import BlogDialogs from '@/feature/blog/components/BlogDialogs'
import {ErrorState} from '@/components/error-state'

function Blog() {
    const [blogList, setFilterData] = useBlogList()
    useSetPageTitle('Backend - Blog')

    if (blogList.error) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Blog</h2>
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
                        <h2 className="text-2xl font-bold tracking-tight">Blog</h2>
                        <p className="text-muted-foreground">Manage your blog posts and tags here.</p>
                    </div>
                </div>

                <Tabs defaultValue="posts" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="tags">Tags</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="space-y-4">
                        <BlogTable
                            posts={blogList.data?.posts ?? []}
                            maxPages={blogList.data?.totalPages}
                            loading={blogList.isPending}
                            setFilterData={setFilterData}
                        />
                    </TabsContent>
                    <TabsContent value="tags" className="space-y-4">
                        <BlogTagsTable />
                    </TabsContent>
                </Tabs>

                <BlogDialogs />
            </BlogProvider>
        </Main>
    )
}

export default Blog
