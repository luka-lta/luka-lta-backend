import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { TextInput } from '@/components/form/TextInput'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/kibo-ui/spinner/index.tsx'
import { BlogPostType } from '@/feature/blog/schema/BlogSchema'
import { useBlogTags, useTogglePublishBlogPost, useUpdateBlogPost } from '@/api/blog/hooks.ts'

const editBlogSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    excerpt: z.string().nullable().default(null),
    content: z.string().min(1, 'Content is required'),
    tag_ids: z.array(z.number()).default([]),
    isPublished: z.boolean(),
})

type EditBlogData = z.infer<typeof editBlogSchema>

interface Props {
    currentRow: BlogPostType
    open: boolean
    onOpenChange: (open: boolean) => void
}

function EditBlogSheet({ currentRow, open, onOpenChange }: Props) {
    const { data: tagsData } = useBlogTags()

    const form = useForm<EditBlogData>({
        resolver: zodResolver(editBlogSchema),
        defaultValues: {
            title: currentRow.title,
            excerpt: currentRow.excerpt ?? '',
            content: currentRow.content,
            tag_ids: currentRow.tags.map((t) => t.tagId),
            isPublished: currentRow.isPublished,
        },
    })

    const updateBlog = useUpdateBlogPost(currentRow.blogId)
    const togglePublish = useTogglePublishBlogPost(currentRow.blogId)

    const onSubmit: SubmitHandler<EditBlogData> = (data) => {
        updateBlog.mutate({
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            tag_ids: data.tag_ids,
        }, {
            onSuccess: () => {
                if (data.isPublished !== currentRow.isPublished) {
                    togglePublish.mutate(data.isPublished, {
                        onSuccess: () => {
                            onOpenChange(false)
                            toast.success('Blog post updated!')
                        },
                        onError: (error) => toast.error(error.message),
                    })
                    return
                }
                onOpenChange(false)
                toast.success('Blog post updated!')
            },
            onError: (error) => toast.error(error.message),
        })
    }

    const toggleTag = (tagId: number, checked: boolean) => {
        const current = form.getValues('tag_ids')
        form.setValue(
            'tag_ids',
            checked ? [...current, tagId] : current.filter((id) => id !== tagId)
        )
    }

    const isPending = updateBlog.isPending || togglePublish.isPending
    const error = updateBlog.error ?? togglePublish.error

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto max-w-xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <SheetHeader>
                        <SheetTitle>Edit Blog Post</SheetTitle>
                        <SheetDescription>Update content, tags and publish status</SheetDescription>
                    </SheetHeader>

                    <Separator className="mt-3" />

                    <div className="py-6 space-y-5">
                        <TextInput
                            name="title"
                            id="blog-title-edit"
                            label="Title"
                            form={form}
                            placeholder="My blog post"
                            type="text"
                        />

                        <div className="flex flex-col items-start gap-2">
                            <Label htmlFor="blog-excerpt-edit">Excerpt</Label>
                            <Textarea
                                id="blog-excerpt-edit"
                                placeholder="Short summary..."
                                {...form.register('excerpt')}
                            />
                        </div>

                        <div className="flex flex-col items-start gap-2">
                            <Label htmlFor="blog-content-edit">
                                Content{' '}
                                <span className="text-muted-foreground text-xs">(Markdown)</span>
                            </Label>
                            <Textarea
                                id="blog-content-edit"
                                className="min-h-56 font-mono text-sm"
                                {...form.register('content')}
                            />
                            {form.formState.errors.content && (
                                <span className="text-red-500 text-sm">
                                    {form.formState.errors.content.message}
                                </span>
                            )}
                        </div>

                        {tagsData && tagsData.tags.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-3">
                                    {tagsData.tags.map((tag) => (
                                        <div key={tag.tagId} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`tag-edit-${tag.tagId}`}
                                                defaultChecked={currentRow.tags.some(
                                                    (t) => t.tagId === tag.tagId
                                                )}
                                                onCheckedChange={(checked: boolean | 'indeterminate') =>
                                                    toggleTag(tag.tagId, !!checked)
                                                }
                                            />
                                            <Label htmlFor={`tag-edit-${tag.tagId}`}>
                                                {tag.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col items-start gap-2">
                            <Label htmlFor="blog-published-edit">Published</Label>
                            <Controller
                                control={form.control}
                                name="isPublished"
                                render={({field}) => (
                                    <Switch
                                        id="blog-published-edit"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Failed to update post</AlertTitle>
                                <AlertDescription>{error.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <SheetFooter>
                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending && <Spinner size={16} />}
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

export default EditBlogSheet
