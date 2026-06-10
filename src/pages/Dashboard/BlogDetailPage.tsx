import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Main } from '@/components/layout/main'
import { useSetPageTitle } from '@/hooks/useSetPageTitle'
import { FetchWrapper } from '@/lib/fetchWrapper'
import { useBlogPost } from '@/feature/blog/hooks/useBlogPost'
import { useBlogTags } from '@/feature/blog/hooks/useBlogTags'
import BlogEditorForm, { BlogEditorData } from '@/feature/blog/components/editor/BlogEditorForm'
import { Skeleton } from '@/components/ui/skeleton'

function BlogDetailPage() {
    useSetPageTitle('Backend - Edit Blog Post')
    const { blogId } = useParams<{ blogId: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: post, isPending: postLoading } = useBlogPost(blogId ?? '')
    const { data: tagsData } = useBlogTags()

    const updatePost = useMutation({
        mutationFn: async (data: BlogEditorData) => {
            const fw = new FetchWrapper(FetchWrapper.baseUrl)
            await fw.put(`/blog/${blogId}`, {
                title: data.title,
                excerpt: data.excerpt || null,
                content: data.content,
                tag_ids: data.tag_ids,
            })

            if (post && data.isPublished !== post.isPublished) {
                await fw.patch(`/blog/${blogId}/publish`, { published: data.isPublished })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog', 'list'] })
            queryClient.invalidateQueries({ queryKey: ['blog', 'detail', blogId] })
            toast.success('Blog post updated!')
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

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
                onSubmit={(data) => updatePost.mutate(data)}
                isPending={updatePost.isPending}
                submitLabel="Save Changes"
                onCancel={() => navigate('/dashboard/blog')}
            />
        </Main>
    )
}

export default BlogDetailPage
