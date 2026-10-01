import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Main } from '@/components/layout/main'
import { useSetPageTitle } from '@/hooks/useSetPageTitle'
import { useBlogPost, useBlogTags, useTogglePublishBlogPost, useUpdateBlogPost } from '@/api/blog/hooks.ts'
import BlogEditorForm, { BlogEditorData } from '@/feature/blog/components/editor/BlogEditorForm'
import { Skeleton } from '@/components/ui/skeleton'

function BlogDetailPage() {
    useSetPageTitle('Backend - Edit Blog Post')
    const { blogId } = useParams<{ blogId: string }>()
    const navigate = useNavigate()

    const { data: post, isPending: postLoading } = useBlogPost(blogId ?? '')
    const { data: tagsData } = useBlogTags()

    const updatePost = useUpdateBlogPost(blogId ?? '')
    const togglePublish = useTogglePublishBlogPost(blogId ?? '')

    const handleSubmit = (data: BlogEditorData) => {
        updatePost.mutate({
            title: data.title,
            excerpt: data.excerpt || null,
            content: data.content,
            tag_ids: data.tag_ids,
        }, {
            onSuccess: () => {
                if (post && data.isPublished !== post.isPublished) {
                    togglePublish.mutate(data.isPublished, {
                        onSuccess: () => toast.success('Blog post updated!'),
                        onError: (error) => toast.error(error.message),
                    })
                    return
                }
                toast.success('Blog post updated!')
            },
            onError: (error) => toast.error(error.message),
        })
    }

    if (postLoading) {
        return (
            <Main>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-[520px] w-full" />
                </div>
            </Main>
        )
    }

    if (!post) {
        return (
            <Main>
                <p className="text-muted-foreground">Post not found.</p>
            </Main>
        )
    }

    return (
        <Main>
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">{post.title}</h2>
                <p className="text-muted-foreground text-sm">
                    By {post.user.username} · {post.isPublished ? 'Published' : 'Draft'}
                </p>
            </div>

            <BlogEditorForm
                defaultValues={{
                    title: post.title,
                    excerpt: post.excerpt ?? '',
                    content: post.content,
                    tag_ids: post.tags.map((t) => t.tagId),
                    isPublished: post.isPublished,
                }}
                tags={tagsData?.tags ?? []}
                onSubmit={handleSubmit}
                isPending={updatePost.isPending || togglePublish.isPending}
                submitLabel="Save Changes"
                onCancel={() => navigate('/dashboard/blog')}
            />
        </Main>
    )
}

export default BlogDetailPage
