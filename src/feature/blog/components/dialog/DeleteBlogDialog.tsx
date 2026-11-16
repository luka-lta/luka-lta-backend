import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { BlogPostType } from '@/feature/blog/schema/BlogSchema'
import { useDeleteBlogPost } from '@/api/blog/hooks.ts'
import { getApiErrorMessage } from '@/lib/apiError'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: Pick<BlogPostType, 'blogId' | 'title'>
    onDeleted?: () => void
}

function DeleteBlogDialog({ open, onOpenChange, currentRow, onDeleted }: Props) {
    const deleteBlog = useDeleteBlogPost()

    const handleConfirm = () => {
        deleteBlog.mutate(currentRow.blogId, {
            onSuccess: () => {
                onOpenChange(false)
                onDeleted?.()
                toast.success('Beitrag gelöscht')
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handleConfirm}
            isLoading={deleteBlog.isPending}
            destructive
            title='Beitrag löschen?'
            description={
                <>
                    <span className='font-medium text-foreground'>{currentRow.title}</span> wird dauerhaft entfernt.
                    Das kann nicht rückgängig gemacht werden.
                </>
            }
            confirmLabel='Löschen'
        />
    )
}

export default DeleteBlogDialog
