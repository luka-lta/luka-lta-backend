import { useMemo, useState } from 'react'
import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, Search, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/form/TextInput'
import { TimeCell } from '@/components/TimeCell.tsx'
import { PageToolbar } from '@/components/layout/page'
import { SearchInput } from '@/components/data/search-input'
import { DataTable } from '@/components/data/data-table'
import { RowActions } from '@/components/data/row-actions'
import { TablePagination } from '@/components/data/table-pagination'
import { EmptyState } from '@/components/feedback/empty-state'
import { ErrorState } from '@/components/feedback/error-state'
import { FormDialog } from '@/components/dialogs/form-dialog'
import { useBlogTags, useCreateBlogTag, useDeleteBlogTag } from '@/api/blog/hooks.ts'
import { TagType } from '@/feature/blog/schema/BlogSchema'
import { useUndoToast } from '@/hooks/useUndoToast.ts'
import { getApiErrorMessage } from '@/lib/apiError'

const createTagSchema = z.object({
    name: z.string().trim().min(1, 'Name ist erforderlich').max(50, 'Höchstens 50 Zeichen'),
})

type CreateTagData = z.infer<typeof createTagSchema>

const col = createColumnHelper<TagType>()

function BlogTagsTable() {
    const tagsQuery = useBlogTags()
    const [createOpen, setCreateOpen] = useState(false)
    const [search, setSearch] = useState('')
    const { trigger: triggerUndoToast } = useUndoToast()

    const form = useForm<CreateTagData>({ resolver: zodResolver(createTagSchema), defaultValues: { name: '' } })
    const createTag = useCreateBlogTag()
    const deleteTag = useDeleteBlogTag()

    const handleDelete = (tag: TagType) => {
        triggerUndoToast({
            message: `Tag „${tag.name}“ wird gelöscht…`,
            undoLabel: 'Rückgängig',
            onConfirm: () => deleteTag.mutateAsync(tag),
            onError: () => toast.error(`Tag „${tag.name}“ konnte nicht gelöscht werden`),
        })
    }

    const onSubmit: SubmitHandler<CreateTagData> = (data) => createTag.mutate(data.name, {
        onSuccess: () => {
            form.reset()
            setCreateOpen(false)
            toast.success('Tag angelegt')
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
    })

    const tags = useMemo(() => {
        const query = search.trim().toLowerCase()
        const all = tagsQuery.data?.tags ?? []
        if (!query) return all
        return all.filter((tag) => tag.name.toLowerCase().includes(query) || tag.slug.toLowerCase().includes(query))
    }, [tagsQuery.data, search])

    const columns = [
        col.accessor('name', {
            header: 'Name',
            cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
        }),
        col.accessor('slug', {
            header: 'Slug',
            meta: { className: 'hidden sm:table-cell' },
            cell: ({ getValue }) => <code className='font-mono text-xs text-muted-foreground'>{getValue()}</code>,
        }),
        col.accessor('createdAt', {
            header: 'Erstellt',
            meta: { className: 'hidden md:table-cell' },
            cell: ({ getValue }) => <TimeCell iso={getValue()} />,
        }),
        col.display({
            id: 'actions',
            header: () => <span className='sr-only'>Aktionen</span>,
            meta: { className: 'w-12 text-right', skeletonClassName: 'w-6' },
            cell: ({ row }) => (
                <RowActions
                    label={row.original.name}
                    actions={[{ label: 'Löschen', icon: Trash2, destructive: true, onSelect: () => handleDelete(row.original) }]}
                />
            ),
        }),
    ]

    const table = useReactTable({ data: tags, columns, getCoreRowModel: getCoreRowModel() })

    if (tagsQuery.error) {
        return <ErrorState title='Tags konnten nicht geladen werden' error={tagsQuery.error} onRetry={() => tagsQuery.refetch()} />
    }

    return (
        <div className='space-y-4'>
            <PageToolbar
                actions={
                    <Button variant='outline' onClick={() => setCreateOpen(true)}>
                        <Plus />
                        Tag anlegen
                    </Button>
                }
            >
                <SearchInput value={search} onChange={setSearch} placeholder='Tags durchsuchen…' />
                {search && <Button variant='ghost' onClick={() => setSearch('')}>Filter zurücksetzen</Button>}
            </PageToolbar>

            <DataTable
                table={table}
                loading={tagsQuery.isPending}
                skeletonRows={5}
                empty={
                    search ? (
                        <EmptyState
                            variant='plain'
                            icon={Search}
                            title='Keine Treffer'
                            description='Kein Tag passt zu deiner Suche.'
                            action={<Button variant='outline' size='sm' onClick={() => setSearch('')}>Filter zurücksetzen</Button>}
                        />
                    ) : (
                        <EmptyState
                            variant='plain'
                            icon={Tag}
                            title='Noch keine Tags'
                            description='Tags gruppieren Beiträge nach Themen.'
                            action={<Button variant='outline' size='sm' onClick={() => setCreateOpen(true)}>Tag anlegen</Button>}
                        />
                    )
                }
                footer={<TablePagination page={1} totalPages={1} rowCount={tags.length} onPageChange={() => undefined} />}
            />

            <FormDialog
                open={createOpen}
                onOpenChange={(open) => {
                    setCreateOpen(open)
                    if (!open) form.reset()
                }}
                size='sm'
                title='Tag anlegen'
                description='Der Slug wird automatisch aus dem Namen erzeugt.'
                onSubmit={form.handleSubmit(onSubmit)}
                submitLabel='Anlegen'
                isSubmitting={createTag.isPending}
            >
                <TextInput name='name' id='tag-name-create' label='Name' form={form} placeholder='z. B. PHP' type='text' />
            </FormDialog>
        </div>
    )
}

export default BlogTagsTable
