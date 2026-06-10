import { Main } from '@/components/layout/main'
import BlogTagsTable from '@/feature/blog/components/BlogTagsTable'
import { useSetPageTitle } from '@/hooks/useSetPageTitle'

function BlogTagsPage() {
    useSetPageTitle('Backend - Blog Tags')
    return (
        <Main>
            <BlogTagsTable />
        </Main>
    )
}

export default BlogTagsPage
