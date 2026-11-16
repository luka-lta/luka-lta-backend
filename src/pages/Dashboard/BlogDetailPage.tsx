import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer, PageHeader } from '@/components/layout/page'
import { RowActions } from '@/components/data/row-actions'
import { ErrorState } from '@/components/feedback/error-state'
import { DetailPageSkeleton } from '@/components/feedback/loading-state'
import { TimeCell } from '@/components/TimeCell.tsx'
import { useBlogPost, useBlogTags, useTogglePublishBlogPost, useUpdateBlogPost } from '@/api/blog/hooks.ts'
import BlogEditorForm, { BLOG_EDITOR_FORM_ID, BlogEditorData } from '@/feature/blog/components/editor/BlogEditorForm'
import DeleteBlogDialog from '@/feature/blog/components/dialog/DeleteBlogDialog'
import { BlogPostStatus } from '@/feature/blog/components/BlogPostStatus'
import { getApiErrorMessage } from '@/lib/apiError'

function BlogDetailPage() {
    const { blogId = '' } = useParams<{ blogId: string }>()
    const navigate = useNavigate()

    const postQuery = useBlogPost(blogId)
    const post = postQuery.data
    const { data: tagsData } = useBlogTags()

    const updatePost = useUpdateBlogPost(blogId)
    const togglePublish = useTogglePublishBlogPost(blogId)
    const isPending = updatePost.isPending || togglePublish.isPending

    const [dirty, setDirty] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

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
                        onSuccess: () => toast.success(data.isPublished ? 'Beitrag veröffentlicht' : 'Beitrag zurückgezogen'),
                        onError: (error) => toast.error(getApiErrorMessage(error)),
                    })
                    return
                }
                toast.success('Beitrag gespeichert')
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        })
    }

    if (postQuery.isPending) {
        return (
            <PageContainer title='Beitrag'>
                <DetailPageSkeleton />
            </PageContainer>
        )
    }

    if (postQuery.error || !post) {
        return (
            <PageContainer title='Beitrag'>
                <PageHeader back={{ to: '/dashboard/blog', label: 'Blog' }} title='Beitrag' />
                <ErrorState
                    title='Beitrag konnte nicht geladen werden'
                    error={postQuery.error ?? undefined}
                    message={postQuery.error ? undefined : 'Diesen Beitrag gibt es nicht (mehr).'}
                    onRetry={postQuery.error ? () => postQuery.refetch() : undefined}
                    action={<Button variant='outline' onClick={() => navigate('/dashboard/blog')}>Zur Übersicht</Button>}
                />
            </PageContainer>
        )
    }

    return (
        <PageContainer title={post.title}>
            <PageHeader
                back={{ to: '/dashboard/blog', label: 'Blog' }}
                title={post.title}
                meta={
                    <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                        <BlogPostStatus published={post.isPublished} />
                        <span>von {post.user.username}</span>
                        <span aria-hidden>·</span>
                        <span>
                            {post.updatedAt ? 'bearbeitet ' : 'erstellt '}
                            <TimeCell iso={post.updatedAt ?? post.createdAt} />
                        </span>
                        {dirty && <span className='font-medium text-warning'>Ungespeicherte Änderungen</span>}
                    </div>
                }
                actions={
                    <>
                        <Button type='submit' form={BLOG_EDITOR_FORM_ID} disabled={isPending || !dirty}>
                            {isPending && <Loader2 className='animate-spin' />}
                            Speichern
                        </Button>
                        <RowActions
                            className='size-9'
                            label={post.title}
                            actions={[{ label: 'Löschen', icon: Trash2, destructive: true, onSelect: () => setDeleteOpen(true) }]}
                        />
                    </>
                }
            />

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
                onDirtyChange={setDirty}
            />

            <DeleteBlogDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                currentRow={post}
                onDeleted={() => navigate('/dashboard/blog')}
            />
        </PageContainer>
    )
}

export default BlogDetailPage
