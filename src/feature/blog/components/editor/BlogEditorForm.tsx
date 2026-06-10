import { useEffect } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { MultiSelect } from '@/components/ui/multi-select'
import { TagType } from '@/feature/blog/schema/BlogSchema'
import { Loader2 } from 'lucide-react'
import MarkdownEditor from '@/components/markdown-editor/MarkdownEditor'

const blogEditorSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    excerpt: z.string().nullable().default(null),
    content: z.string().min(1, 'Content is required'),
    tag_ids: z.array(z.number()).default([]),
    isPublished: z.boolean().default(false),
})

export type BlogEditorData = z.infer<typeof blogEditorSchema>

interface Props {
    defaultValues?: Partial<BlogEditorData>
    tags: TagType[]
    onSubmit: SubmitHandler<BlogEditorData>
    isPending: boolean
    submitLabel: string
    onCancel: () => void
}

function BlogEditorForm({ defaultValues, tags, onSubmit, isPending, submitLabel, onCancel }: Props) {
    const form = useForm<BlogEditorData>({
        resolver: zodResolver(blogEditorSchema),
        defaultValues: {
            title: '',
            excerpt: '',
            content: '',
            tag_ids: [],
            isPublished: false,
            ...defaultValues,
        },
    })

    useEffect(() => {
        if (defaultValues) {
            form.reset({ title: '', excerpt: '', content: '', tag_ids: [], isPublished: false, ...defaultValues })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(defaultValues)])

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Title + published row */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
                <div className="flex-1 space-y-1.5">
                    <Label htmlFor="blog-title">Title *</Label>
                    <Input
                        id="blog-title"
                        placeholder="My awesome post"
                        {...form.register('title')}
                    />
                    {form.formState.errors.title && (
                        <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-6">
                    <Label htmlFor="blog-published">Published</Label>
                    <Controller
                        control={form.control}
                        name="isPublished"
                        render={({ field }) => (
                            <Switch
                                id="blog-published"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="blog-excerpt">Excerpt</Label>
                <Textarea
                    id="blog-excerpt"
                    placeholder="Short summary shown in listings..."
                    className="resize-none"
                    rows={2}
                    {...form.register('excerpt')}
                />
            </div>

            {tags.length > 0 && (
                <div className="space-y-1.5">
                    <Label>Tags</Label>
                    <Controller
                        control={form.control}
                        name="tag_ids"
                        render={({ field }) => (
                            <MultiSelect
                                options={tags.map((t) => ({ label: t.name, value: String(t.tagId) }))}
                                defaultValue={field.value.map(String)}
                                onValueChange={(vals) => field.onChange(vals.map(Number))}
                                placeholder="Select tags..."
                            />
                        )}
                    />
                </div>
            )}

            <div className="space-y-1.5">
                <Label>
                    Content *{' '}
                    <span className="text-muted-foreground text-xs font-normal">(Markdown)</span>
                </Label>
                <Controller
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <MarkdownEditor
                            value={field.value}
                            onChange={field.onChange}
                            height={520}
                        />
                    )}
                />
                {form.formState.errors.content && (
                    <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    )
}

export default BlogEditorForm
