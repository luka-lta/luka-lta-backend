import LinksTable from "@/components/dashboard/linktree/LinksTable.tsx";
import {LinkEditDialog} from "@/components/dashboard/linktree/dialog/LinkEditDialog.tsx";
import LinkAddDialog from "@/components/dashboard/linktree/dialog/LinkAddDialog.tsx";
import {useEffect, useState} from "react";
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import LinkDeleteDialog from "@/components/dashboard/linktree/dialog/LinkDeleteDialog.tsx";
import useLinkStore from "@/stores/LinkStore.ts";
import {toast} from "sonner";
import SearchBar from "@/components/SearchBar.tsx";
import AddButton from "@/components/button/AddButton.tsx";

function LinktreePage() {
    const {fetchLinks, links} = useLinkStore();
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

    const handleSearch = (searchTerm: string) => {
        console.log(searchTerm);
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Linktree Management</h1>

            <div className="flex justify-between items-center">
                <SearchBar onSearch={handleSearch} placeholder='Search link...'/>
                <AddButton onClick={() => setCreate(true)}/>
            </div>

            <div className="mt-8">
                <LinksTable
                    links={links}
                    editingLink={editingLink}
                    setEditingLink={setEditingLink}
                    setEdit={setEdit}
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