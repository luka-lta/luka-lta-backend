import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Main } from '@/components/layout/main'
import { useSetPageTitle } from '@/hooks/useSetPageTitle'
import { FetchWrapper } from '@/lib/fetchWrapper'
import { useBlogTags } from '@/feature/blog/hooks/useBlogTags'
import BlogEditorForm, { BlogEditorData } from '@/feature/blog/components/editor/BlogEditorForm'
import { z } from 'zod'
import { BlogPostSchema } from '@/feature/blog/schema/BlogSchema'

const createResponseSchema = z.object({ post: BlogPostSchema })

function BlogCreatePage() {
    useSetPageTitle('Backend - New Blog Post')
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data: tagsData } = useBlogTags()

    const createPost = useMutation({
        mutationFn: async (data: BlogEditorData) => {
            const fw = new FetchWrapper(FetchWrapper.baseUrl)
            const response = await fw.post('/blog', {
                title: data.title,
                excerpt: data.excerpt || null,
                content: data.content,
                tag_ids: data.tag_ids,
            })

            const post = createResponseSchema.parse(response.data).post
            if (data.isPublished && post?.blogId) {
                await fw.patch(`/blog/${post.blogId}/publish`, { published: true })
            }

            return post
        },
        onSuccess: (post) => {
            queryClient.invalidateQueries({ queryKey: ['blog', 'list'] })
            toast.success('Blog post created!')
            navigate(post?.blogId ? `/dashboard/blog/${post.blogId}` : '/dashboard/blog')
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    return (
        <Main>
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">New Blog Post</h2>
                <p className="text-muted-foreground">Write and publish a new post.</p>
            </div>

            <BlogEditorForm
                tags={tagsData?.tags ?? []}
                onSubmit={(data) => createPost.mutate(data)}
                isPending={createPost.isPending}
                submitLabel="Create Post"
                onCancel={() => navigate('/dashboard/blog')}
            />
        </Main>
    )
}

export default BlogCreatePage
