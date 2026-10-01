import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash } from 'lucide-react'
import { TextInput } from '@/components/form/TextInput'
import { TimeCell } from '@/components/TimeCell.tsx'
import { useBlogTags, useCreateBlogTag, useDeleteBlogTag } from '@/api/blog/hooks.ts'
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
import { Spinner } from '@/components/ui/kibo-ui/spinner/index.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useUndoToast } from '@/hooks/useUndoToast.ts'

const createTagSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
})

type CreateTagData = z.infer<typeof createTagSchema>

function BlogTagsTable() {
    const { data: tagsData, isLoading } = useBlogTags()
    const [createOpen, setCreateOpen] = useState(false)
    const [search, setSearch] = useState('')
    const { trigger: triggerUndoToast } = useUndoToast()

    const form = useForm<CreateTagData>({
        resolver: zodResolver(createTagSchema),
    })

    const createTag = useCreateBlogTag()
    const deleteTag = useDeleteBlogTag()

    const handleDelete = (tag: TagType) => {
        triggerUndoToast({
            message: `Deleting tag "${tag.name}"...`,
            onConfirm: () => deleteTag.mutateAsync(tag),
            onError: (label) => toast.error(`Failed to delete: ${label}`),
        })
    }

    const onSubmit: SubmitHandler<CreateTagData> = (data) => createTag.mutate(data.name, {
        onSuccess: () => {
            form.reset()
            setCreateOpen(false)
            toast.success('Tag created!')
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const filteredTags = (tagsData?.tags ?? []).filter((tag) =>
        tag.name.toLowerCase().includes(search.toLowerCase()) ||
        tag.slug.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
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
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner size={16} />
                                        Loading...
                                    </div>
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
                                <TableCell><TimeCell iso={tag.createdAt}/></TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(tag)}
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
                                {createTag.isPending && <Spinner size={16} />}
                                {createTag.isPending ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default BlogTagsTable
