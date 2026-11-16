import {useLinksContext} from "@/feature/linktree/context/links-context.tsx";
import {CreateLinkDialog} from "@/feature/linktree/components/dialog/CreateLinkDialog.tsx";
import DeleteLinkDialog from "@/feature/linktree/components/dialog/DeleteLinkDialog.tsx";
import DeactivateLinkDialog from "@/feature/linktree/components/dialog/DeactivateLinkDialog.tsx";

function LinksDialogs() {
    const {open, setOpen, currentRow, setCurrentRow} = useLinksContext();

    return (
        <>
            <CreateLinkDialog
                key='link-add'
                open={open === 'add'}
                onOpenChange={(next) => setOpen(next ? 'add' : null)}
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

                    <DeactivateLinkDialog
                        key={`link-deactivate-${currentRow.clickTag}`}
                        open={open === 'deactivate'}
                        onOpenChange={() => {
                            setOpen('deactivate')
                            setTimeout(() => {
                                setCurrentRow(null)
                            }, 500)
                        }}
                        currentRow={currentRow}
                    />

                </>
            )}
        </>
    );
}

export default LinksDialogs;