import LinksTable from "@/components/dashboard/linktree/LinksTable.tsx";
import {LinkEditDialog} from "@/components/dashboard/linktree/dialog/LinkEditDialog.tsx";
import LinkAddDialog from "@/components/dashboard/linktree/dialog/LinkAddDialog.tsx";
import {useState} from "react";
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";

function LinktreePage() {
    const [editingLink, setEditingLink] = useState<LinkItemTypeSchema | undefined>()
    const [edit, setEdit] = useState(false);
    const [create, setCreate] = useState(false);

    return (
        <div className="container mx-auto py-10 bg-muted/50 rounded-lg">
            <h1 className="text-2xl font-bold mb-5">Linktree Management</h1>
            <div className="mt-8">
                <LinksTable
                    editingLink={editingLink}
                    setEditingLink={setEditingLink}
                    edit={edit}
                    setEdit={setEdit}
                    setCreate={setCreate}
                    create={create}
                />
            </div>

            <LinkEditDialog
                open={edit}
                onOpenChange={(open) => {
                    setEdit(open)
                    if (!open) setEditingLink(undefined)
                }}
                initialData={editingLink}
            />
            <LinkAddDialog open={create} onOpenChange={(open) => setCreate(open)}/>
        </div>
    )
}

export default LinktreePage;