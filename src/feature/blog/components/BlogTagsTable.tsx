import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { FetchWrapper } from '@/lib/fetchWrapper'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { TextInput } from '@/components/form/TextInput'
import { useBlogTags } from '@/feature/blog/hooks/useBlogTags'
import { TagType } from '@/feature/blog/schema/BlogSchema'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const createTagSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
})

type CreateTagData = z.infer<typeof createTagSchema>

function BlogTagsTable() {
    const queryClient = useQueryClient()
    const { data: tagsData, isLoading } = useBlogTags()
    const [createOpen, setCreateOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [deleteTarget, setDeleteTarget] = useState<TagType | null>(null)

    const form = useForm<CreateTagData>({
        resolver: zodResolver(createTagSchema),
    })

    const createTag = useMutation({
        mutationFn: async (data: CreateTagData) => {
            const fw = new FetchWrapper(FetchWrapper.baseUrl)
            await fw.post('/blog/tags', { name: data.name })
        },
        onSuccess: () => {
            form.reset()
            setCreateOpen(false)
            toast.success('Tag created!')
            queryClient.invalidateQueries({ queryKey: ['blog', 'tags'] })
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const deleteTag = useMutation({
        mutationFn: async (tag: TagType) => {
            const fw = new FetchWrapper(FetchWrapper.baseUrl)
            await fw.delete(`/blog/tags/${tag.tagId}`)
        },
        onSuccess: () => {
            setDeleteTarget(null)
            toast.success('Tag deleted!')
            queryClient.invalidateQueries({ queryKey: ['blog', 'tags'] })
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const onSubmit: SubmitHandler<CreateTagData> = (data) => createTag.mutate(data)

    const filteredTags = (tagsData?.tags ?? []).filter((tag) =>
        tag.name.toLowerCase().includes(search.toLowerCase()) ||
        tag.slug.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Blog Tags</h2>
                <p className="text-muted-foreground">Manage tags for blog posts.</p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Search tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <Button onClick={() => setCreateOpen(true)}>+ New Tag</Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && filteredTags.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    {search ? 'No tags match your search.' : 'No tags yet.'}
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredTags.map((tag) => (
                            <TableRow key={tag.tagId}>
                                <TableCell className="font-medium">{tag.name}</TableCell>
                                <TableCell className="text-muted-foreground font-mono text-sm">
                                    {tag.slug}
                                </TableCell>
                                <TableCell>{formatDate(tag.createdAt)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteTarget(tag)}
                                    >
                                        <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) form.reset() }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Tag</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <TextInput
                            name="name"
                            id="tag-name-create"
                            label="Tag Name"
                            form={form}
                            placeholder="e.g. PHP"
                            type="text"
                        />
                        {createTag.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{createTag.error.message}</AlertDescription>
                            </Alert>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createTag.isPending}>
                                {createTag.isPending ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {deleteTarget && (
                <ConfirmDialog
                    open={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                    handleConfirm={() => deleteTag.mutate(deleteTarget)}
                    title={
                        <span className="text-destructive">
                            <AlertTriangle className="stroke-destructive mr-1 inline-block" size={18} />
                            Delete Tag
                        </span>
                    }
                    desc={
                        <p>
                            Are you sure you want to delete <span className="font-bold">{deleteTarget.name}</span>?
                            This action cannot be undone.
                        </p>
                    }
                    confirmText={deleteTag.isPending ? 'Deleting...' : 'Delete'}
                    isLoading={deleteTag.isPending}
                    destructive
                />
            )}
        </div>
    )
}

export default BlogTagsTable
