import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Main } from '@/components/layout/main'
import { useSetPageTitle } from '@/hooks/useSetPageTitle'
import { useBlogTags, useCreateBlogPost, usePublishBlogPost } from '@/api/blog/hooks.ts'
import BlogEditorForm, { BlogEditorData } from '@/feature/blog/components/editor/BlogEditorForm'

function BlogCreatePage() {
    useSetPageTitle('Backend - New Blog Post')
    const navigate = useNavigate()
    const { data: tagsData } = useBlogTags()

    const createPost = useCreateBlogPost()
    const togglePublish = usePublishBlogPost()

    const handleSubmit = (data: BlogEditorData) => {
        createPost.mutate({
            title: data.title,
            excerpt: data.excerpt || null,
            content: data.content,
            tag_ids: data.tag_ids,
        }, {
            onSuccess: (post) => {
                if (data.isPublished && post.blogId) {
                    togglePublish.mutate({blogId: post.blogId, published: true}, {
                        onSuccess: () => {
                            toast.success('Blog post created!')
                            navigate(`/dashboard/blog/${post.blogId}`)
                        },
                        onError: (error) => toast.error(error.message),
                    })
                    return
                }
                toast.success('Blog post created!')
                navigate(post.blogId ? `/dashboard/blog/${post.blogId}` : '/dashboard/blog')
            },
            onError: (error) => toast.error(error.message),
        })
    }

    return (
        <Main>
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">New Blog Post</h2>
                <p className="text-muted-foreground">Write and publish a new post.</p>
            </div>

            <BlogEditorForm
                tags={tagsData?.tags ?? []}
                onSubmit={handleSubmit}
                isPending={createPost.isPending || togglePublish.isPending}
                submitLabel="Create Post"
                onCancel={() => navigate('/dashboard/blog')}
            />
        </Main>
    )
}

export default BlogCreatePage
