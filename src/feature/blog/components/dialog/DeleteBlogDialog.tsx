import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AlertTriangle } from 'lucide-react'
import { BlogPostType } from '@/feature/blog/schema/BlogSchema'
import { useDeleteBlogPost } from '@/api/blog/hooks.ts'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: BlogPostType
}

function DeleteBlogDialog({ open, onOpenChange, currentRow }: Props) {
    const deleteBlog = useDeleteBlogPost()

    const handleConfirm = () => {
        deleteBlog.mutate(currentRow.blogId, {
            onSuccess: () => {
                onOpenChange(false)
                toast.success('Blog post deleted!')
            },
            onError: (error) => {
                toast.error(error.message)
            },
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleConfirm}
            title={
                <span className="text-destructive">
                    <AlertTriangle
                        className="stroke-destructive mr-1 inline-block"
                        size={18}
                    />{' '}
                    Delete Blog Post
                </span>
            }
            desc={
                <div className="space-y-4">
                    <p>
                        Are you sure you want to delete{' '}
                        <span className="font-bold">{currentRow.title}</span>?
                        <br />
                        This cannot be undone.
                    </p>
                    <Alert variant="destructive">
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                            This operation cannot be rolled back.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText={deleteBlog.isPending ? 'Deleting...' : 'Delete'}
            isLoading={deleteBlog.isPending}
            destructive
        />
    )
}

export default DeleteBlogDialog
