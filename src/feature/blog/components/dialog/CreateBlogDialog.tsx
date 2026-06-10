import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { FetchWrapper } from '@/lib/fetchWrapper'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { TextInput } from '@/components/form/TextInput'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useBlogTags } from '@/feature/blog/hooks/useBlogTags'

const createBlogSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    excerpt: z.string().nullable().default(null),
    content: z.string().min(1, 'Content is required'),
    tag_ids: z.array(z.number()).default([]),
})

type CreateBlogData = z.infer<typeof createBlogSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateBlogDialog({ open, onOpenChange }: Props) {
    const queryClient = useQueryClient()
    const { data: tagsData } = useBlogTags()

    const form = useForm<CreateBlogData>({
        resolver: zodResolver(createBlogSchema),
        defaultValues: { tag_ids: [] },
    })

    const createBlog = useMutation({
        mutationFn: async (data: CreateBlogData) => {
            const fw = new FetchWrapper(FetchWrapper.baseUrl)
            await fw.post('/blog', data)
        },
        onSuccess: () => {
            onOpenChange(false)
            form.reset()
            toast.success('Blog post created!')
        },
        onError: (error) => {
            toast.error(error.message)
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['blog', 'list'] })
            }, 500)
        },
    })

    const onSubmit: SubmitHandler<CreateBlogData> = (data) => createBlog.mutate(data)

    const toggleTag = (tagId: number, checked: boolean) => {
        const current = form.getValues('tag_ids')
        form.setValue(
            'tag_ids',
            checked ? [...current, tagId] : current.filter((id) => id !== tagId)
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                onOpenChange(false)
                form.reset()
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create Blog Post</DialogTitle>
                        <DialogDescription>Write a new blog post in Markdown</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-6">
                        <TextInput
                            name="title"
                            id="blog-title-create"
                            label="Title"
                            form={form}
                            placeholder="My blog post"
                            type="text"
                        />

                        <div className="flex flex-col items-start gap-2">
                            <Label htmlFor="blog-excerpt-create">Excerpt</Label>
                            <Textarea
                                id="blog-excerpt-create"
                                placeholder="Short summary..."
                                {...form.register('excerpt')}
                            />
                        </div>

                        <div className="flex flex-col items-start gap-2">
                            <Label htmlFor="blog-content-create">
                                Content{' '}
                                <span className="text-muted-foreground text-xs">(Markdown)</span>
                            </Label>
                            <Textarea
                                id="blog-content-create"
                                placeholder="# Heading&#10;&#10;Write your content here..."
                                className="min-h-48 font-mono text-sm"
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
                                                id={`tag-create-${tag.tagId}`}
                                                onCheckedChange={(checked: boolean | 'indeterminate') =>
                                                    toggleTag(tag.tagId, !!checked)
                                                }
                                            />
                                            <Label htmlFor={`tag-create-${tag.tagId}`}>
                                                {tag.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {createBlog.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Failed to create post</AlertTitle>
                                <AlertDescription>{createBlog.error.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button className="w-full" type="submit" disabled={createBlog.isPending}>
                            {createBlog.isPending ? 'Creating...' : 'Create Post'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
