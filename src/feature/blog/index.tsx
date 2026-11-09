import { useNavigate } from 'react-router-dom'
import { PenSquare } from 'lucide-react'
import { useBlogList } from '@/api/blog/hooks.ts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PageContainer, PageHeader } from '@/components/layout/page'
import { ErrorState } from '@/components/feedback/error-state'
import BlogProvider from '@/feature/blog/context/blog-context'
import BlogTable from '@/feature/blog/components/BlogTable'
import BlogTagsTable from '@/feature/blog/components/BlogTagsTable'
import BlogDialogs from '@/feature/blog/components/BlogDialogs'

function Blog() {
    const navigate = useNavigate()
    const [blogList, setFilterData] = useBlogList()

    return (
        <BlogProvider>
            <PageContainer title='Blog'>
                <PageHeader
                    title='Blog'
                    description='Beiträge schreiben, veröffentlichen und verschlagworten.'
                    actions={
                        <Button onClick={() => navigate('/dashboard/blog/create')}>
                            <PenSquare />
                            Beitrag schreiben
                        </Button>
                    }
                />

                <Tabs defaultValue='posts' className='space-y-4'>
                    <TabsList>
                        <TabsTrigger value='posts'>Beiträge</TabsTrigger>
                        <TabsTrigger value='tags'>Tags</TabsTrigger>
                    </TabsList>
                    <TabsContent value='posts' className='mt-0'>
                        {blogList.error ? (
                            <ErrorState
                                title='Beiträge konnten nicht geladen werden'
                                error={blogList.error}
                                onRetry={() => blogList.refetch()}
                            />
                        ) : (
                            <BlogTable
                                posts={blogList.data?.posts ?? []}
                                maxPages={blogList.data?.totalPages}
                                loading={blogList.isPending}
                                setFilterData={setFilterData}
                            />
                        )}
                    </TabsContent>
                    <TabsContent value='tags' className='mt-0'>
                        <BlogTagsTable />
                    </TabsContent>
                </Tabs>
            </PageContainer>
            <BlogDialogs />
        </BlogProvider>
    )
}

export default Blog
