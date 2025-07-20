import {useLinksContext} from "@/feature/linktree/context/links-context.tsx";
import {CreateLinkDialog} from "@/feature/linktree/components/dialog/CreateLinkDialog.tsx";
import DeleteLinkDialog from "@/feature/linktree/components/dialog/DeleteLinkDialog.tsx";
import EditLinkSheet from "@/feature/linktree/components/sheet/EditLinkSheet.tsx";

function LinksDialogs() {
    const {open, setOpen, currentRow, setCurrentRow} = useLinksContext();

    return (
        <>
            <CreateLinkDialog
                key='link-add'
                open={open === 'add'}
                onOpenChange={() => setOpen('add')}
            />

            {currentRow && (
                <>
                    <DeleteLinkDialog
                        key={`link-delete-${currentRow.clickTag}`}
                        open={open === 'delete'}
                        onOpenChange={() => {
                            setOpen('delete')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />

                    <EditLinkSheet
                        key={`link-edit-${currentRow.clickTag}`}
                        currentRow={currentRow}
                        open={open === 'edit'}
                        onOpenChange={() => {
                            setOpen('edit')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                    />
                </>
            )}
        </>
    );
}

export default LinksDialogs;