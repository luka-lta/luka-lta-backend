import { useBlogContext } from '@/feature/blog/context/blog-context'
import { CreateBlogDialog } from '@/feature/blog/components/dialog/CreateBlogDialog'
import DeleteBlogDialog from '@/feature/blog/components/dialog/DeleteBlogDialog'
import EditBlogSheet from '@/feature/blog/components/sheet/EditBlogSheet'

function BlogDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useBlogContext()

    return (
        <>
            <CreateBlogDialog
                key="blog-add"
                open={open === 'add'}
                onOpenChange={() => setOpen('add')}
            />

            {currentRow && (
                <>
                    <DeleteBlogDialog
                        key={`blog-delete-${currentRow.blogId}`}
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen('delete')
                            setTimeout(() => setCurrentRow(null), 500)
                        }}
                        currentRow={currentRow}
                    />

                    <EditBlogSheet
                        key={`blog-edit-${currentRow.blogId}`}
                        currentRow={currentRow}
                        open={open === 'edit'}
                        onOpenChange={() => {
                            setOpen('edit')
                            setTimeout(() => setCurrentRow(null), 500)
                        }}
                    />
                </>
            )}
        </>
    )
}

export default BlogDialogs
