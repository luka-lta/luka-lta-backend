import { useEffect } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Tags,
    TagsContent,
    TagsEmpty,
    TagsGroup,
    TagsInput,
    TagsItem,
    TagsList,
    TagsTrigger,
    TagsValue,
} from '@/components/ui/kibo-ui/tags'
import { TagType } from '@/feature/blog/schema/BlogSchema'
import MarkdownEditor from '@/components/markdown-editor/MarkdownEditor'

const blogEditorSchema = z.object({
    title: z.string().trim().min(1, 'Titel ist erforderlich').max(255, 'Höchstens 255 Zeichen'),
    excerpt: z.string().nullable().default(null),
    content: z.string().min(1, 'Inhalt ist erforderlich'),
    tag_ids: z.array(z.number()).default([]),
    isPublished: z.boolean().default(false),
})

export type BlogEditorData = z.infer<typeof blogEditorSchema>

export const BLOG_EDITOR_FORM_ID = 'blog-editor'

interface Props {
    defaultValues?: Partial<BlogEditorData>
    tags: TagType[]
    onSubmit: SubmitHandler<BlogEditorData>
    /** Wird bei jeder Änderung des Dirty-Status aufgerufen (z. B. für "Ungespeichert"-Hinweis). */
    onDirtyChange?: (dirty: boolean) => void
}

const EMPTY: BlogEditorData = { title: '', excerpt: '', content: '', tag_ids: [], isPublished: false }

/**
 * Formular für Blogbeiträge. Rendert keine Buttons — die Seite platziert
 * "Abbrechen"/"Speichern" im PageHeader und verknüpft sie über `form={BLOG_EDITOR_FORM_ID}`.
 */
function BlogEditorForm({ defaultValues, tags, onSubmit, onDirtyChange }: Props) {
    const form = useForm<BlogEditorData>({
        resolver: zodResolver(blogEditorSchema),
        defaultValues: { ...EMPTY, ...defaultValues },
    })
    const { errors, isDirty } = form.formState

    useEffect(() => {
        if (defaultValues) form.reset({ ...EMPTY, ...defaultValues })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(defaultValues)])

    useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange])

    return (
        <form
            id={BLOG_EDITOR_FORM_ID}
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]'
        >
            <div className='min-w-0 space-y-5'>
                <div className='space-y-2'>
                    <Label htmlFor='blog-title' className={errors.title ? 'text-destructive' : undefined}>Titel</Label>
                    <Input
                        id='blog-title'
                        placeholder='Worum geht es?'
                        className='h-10 text-base'
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? 'blog-title-error' : undefined}
                        {...form.register('title')}
                    />
                    {errors.title && <p id='blog-title-error' className='text-sm text-destructive'>{errors.title.message}</p>}
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='blog-excerpt'>
                        Kurzbeschreibung <span className='font-normal text-muted-foreground'>(optional)</span>
                    </Label>
                    <Textarea
                        id='blog-excerpt'
                        placeholder='Zwei Sätze für Übersichten und Vorschauen…'
                        className='resize-none'
                        rows={2}
                        aria-describedby='blog-excerpt-description'
                        {...form.register('excerpt')}
                    />
                    <p id='blog-excerpt-description' className='text-xs text-muted-foreground'>
                        Erscheint in der Beitragsliste und in Link-Vorschauen.
                    </p>
                </div>

                <div className='space-y-2'>
                    <Label className={errors.content ? 'text-destructive' : undefined}>
                        Inhalt <span className='font-normal text-muted-foreground'>(Markdown)</span>
                    </Label>
                    <Controller
                        control={form.control}
                        name='content'
                        render={({ field }) => (
                            <MarkdownEditor value={field.value} onChange={field.onChange} height={560} />
                        )}
                    />
                    {errors.content && <p className='text-sm text-destructive'>{errors.content.message}</p>}
                </div>
            </div>

            <aside className='space-y-4 lg:sticky lg:top-20 lg:self-start'>
                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle>Veröffentlichung</CardTitle>
                        <CardDescription>Entwürfe sind nur hier im Dashboard sichtbar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5'>
                            <Label htmlFor='blog-published' className='cursor-pointer'>Veröffentlicht</Label>
                            <Controller
                                control={form.control}
                                name='isPublished'
                                render={({ field }) => (
                                    <Switch id='blog-published' checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='pb-3'>
                        <CardTitle>Tags</CardTitle>
                        <CardDescription>
                            {tags.length === 0 ? 'Noch keine Tags angelegt – das geht im Tab „Tags“.' : 'Ordne den Beitrag Themen zu.'}
                        </CardDescription>
                    </CardHeader>
                    {tags.length > 0 && (
                        <CardContent>
                            <Controller
                                control={form.control}
                                name='tag_ids'
                                render={({ field }) => {
                                    const selected = field.value.map(String)

                                    const handleRemove = (value: string) => {
                                        field.onChange(field.value.filter((id) => id !== Number(value)))
                                    }

                                    const handleSelect = (value: string) => {
                                        if (selected.includes(value)) {
                                            handleRemove(value)
                                            return
                                        }
                                        field.onChange([...field.value, Number(value)])
                                    }

                                    return (
                                        <Tags>
                                            <TagsTrigger>
                                                {selected.map((id) => (
                                                    <TagsValue key={id} onRemove={() => handleRemove(id)}>
                                                        {tags.find((t) => String(t.tagId) === id)?.name}
                                                    </TagsValue>
                                                ))}
                                            </TagsTrigger>
                                            <TagsContent>
                                                <TagsInput placeholder='Tags suchen…' />
                                                <TagsList>
                                                    <TagsEmpty>Kein Tag gefunden.</TagsEmpty>
                                                    <TagsGroup>
                                                        {tags.map((tag) => (
                                                            <TagsItem key={tag.tagId} value={String(tag.tagId)} onSelect={handleSelect}>
                                                                {tag.name}
                                                                {selected.includes(String(tag.tagId)) && (
                                                                    <CheckIcon className='text-muted-foreground' size={14} />
                                                                )}
                                                            </TagsItem>
                                                        ))}
                                                    </TagsGroup>
                                                </TagsList>
                                            </TagsContent>
                                        </Tags>
                                    )
                                }}
                            />
                        </CardContent>
                    )}
                </Card>
            </aside>
        </form>
    )
}

export default BlogEditorForm
