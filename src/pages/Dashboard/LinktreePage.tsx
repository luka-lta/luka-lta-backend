import LinksTable from "@/components/dashboard/linktree/LinksTable.tsx";
import {LinkEditDialog} from "@/components/dashboard/linktree/dialog/LinkEditDialog.tsx";
import LinkAddDialog from "@/components/dashboard/linktree/dialog/LinkAddDialog.tsx";
import {useEffect, useState} from "react";
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import LinkDeleteDialog from "@/components/dashboard/linktree/dialog/LinkDeleteDialog.tsx";
import useLinkStore from "@/stores/LinkStore.ts";
import {toast} from "sonner";

function LinktreePage() {
    const {fetchLinks} = useLinkStore();
    const [editingLink, setEditingLink] = useState<LinkItemTypeSchema | undefined>()
    const [deleteLinkId, setDeleteLinkId] = useState<number>(0)
    const [edit, setEdit] = useState(false);
    const [create, setCreate] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);

    useEffect(() => {
        fetchLinks().catch((error: unknown) =>{
            if (error instanceof Error) {
                console.error("Error fetching links:", error);
                toast.error("An error occurred while fetching links.");
            }
        })
    }, [fetchLinks]);

    const handleDialogClose = (dialogType: "edit" | "create" | "delete", open: boolean): void => {
        if (dialogType === "edit") setEdit(open);
        if (dialogType === "create") setCreate(open);
        if (dialogType === "delete") setDeleteDialog(open);

        if (!open) {
            if (dialogType === "edit") setEditingLink(undefined);
            if (dialogType === "delete") setDeleteLinkId(0);
        }
    };

    return (
        <div className="container mx-auto py-10 bg-muted/30 rounded-lg">
            <h1 className="text-2xl font-bold mb-5">Linktree Management</h1>
            <div className="mt-8">
                <LinksTable
                    editingLink={editingLink}
                    setEditingLink={setEditingLink}
                    setEdit={setEdit}
                    setCreate={setCreate}
                    setDeleteLinkId={setDeleteLinkId}
                    setDeleteDialog={setDeleteDialog}
                />
            </div>

            <LinkEditDialog
                open={edit}
                onOpenChange={(open) => handleDialogClose("edit", open)}
                initialData={editingLink}
            />
            <LinkAddDialog
                open={create}
                onOpenChange={(open) => handleDialogClose("create", open)}
            />
            <LinkDeleteDialog
                id={deleteLinkId}
                open={deleteDialog}
                setOpen={(open) => handleDialogClose("delete", open)}
            />
        </div>
    )
}

export default LinktreePage;