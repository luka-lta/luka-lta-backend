import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer, PageHeader } from '@/components/layout/page'
import { useBlogTags, useCreateBlogPost, usePublishBlogPost } from '@/api/blog/hooks.ts'
import BlogEditorForm, { BLOG_EDITOR_FORM_ID, BlogEditorData } from '@/feature/blog/components/editor/BlogEditorForm'
import { getApiErrorMessage } from '@/lib/apiError'

function BlogCreatePage() {
    const navigate = useNavigate()
    const { data: tagsData } = useBlogTags()

    const createPost = useCreateBlogPost()
    const togglePublish = usePublishBlogPost()
    const isPending = createPost.isPending || togglePublish.isPending

    const handleSubmit = (data: BlogEditorData) => {
        createPost.mutate({
            title: data.title,
            excerpt: data.excerpt || null,
            content: data.content,
            tag_ids: data.tag_ids,
        }, {
            onSuccess: (post) => {
                const target = post.blogId ? `/dashboard/blog/${post.blogId}` : '/dashboard/blog'
                if (data.isPublished && post.blogId) {
                    togglePublish.mutate({ blogId: post.blogId, published: true }, {
                        onSuccess: () => {
                            toast.success('Beitrag veröffentlicht')
                            navigate(target)
                        },
                        onError: (error) => {
                            toast.error(`Beitrag als Entwurf gespeichert, Veröffentlichen fehlgeschlagen: ${getApiErrorMessage(error)}`)
                            navigate(target)
                        },
                    })
                    return
                }
                toast.success('Entwurf gespeichert')
                navigate(target)
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        })
    }

    return (
        <PageContainer title='Neuer Beitrag'>
            <PageHeader
                back={{ to: '/dashboard/blog', label: 'Blog' }}
                title='Neuer Beitrag'
                description='Schreib in Markdown. Speichern legt einen Entwurf an, solange „Veröffentlicht“ aus ist.'
                actions={
                    <>
                        <Button variant='outline' onClick={() => navigate('/dashboard/blog')} disabled={isPending}>
                            Abbrechen
                        </Button>
                        <Button type='submit' form={BLOG_EDITOR_FORM_ID} disabled={isPending}>
                            {isPending && <Loader2 className='animate-spin' />}
                            Beitrag anlegen
                        </Button>
                    </>
                }
            />

            <BlogEditorForm tags={tagsData?.tags ?? []} onSubmit={handleSubmit} />
        </PageContainer>
    )
}

export default BlogCreatePage
