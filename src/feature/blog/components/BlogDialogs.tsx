import { useBlogContext } from '@/feature/blog/context/blog-context'
import DeleteBlogDialog from '@/feature/blog/components/dialog/DeleteBlogDialog'

function BlogDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useBlogContext()

    if (!currentRow) return null

    return (
        <DeleteBlogDialog
            key={`blog-delete-${currentRow.blogId}`}
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
                if (isOpen) return
                setOpen(null)
                setTimeout(() => setCurrentRow(null), 300)
            }}
            currentRow={currentRow}
        />
    )
}

export default BlogDialogs
