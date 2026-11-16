import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";
import { useDeleteLink } from "@/api/linktree/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: LinkItemTypeSchema
    onDeleted?: () => void
}

function DeleteLinkDialog({ open, onOpenChange, currentRow, onDeleted }: Props) {
    const deleteLink = useDeleteLink();

    const handleConfirm = () => {
        deleteLink.mutate(currentRow.id, {
            onSuccess: () => {
                onOpenChange(false);
                onDeleted?.();
                toast.success('Link gelöscht');
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        });
    };

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handleConfirm}
            isLoading={deleteLink.isPending}
            destructive
            title="Link löschen?"
            description={
                <>
                    <span className="font-medium text-foreground">{currentRow.displayname}</span> und seine Klick-Historie
                    werden dauerhaft entfernt. Das kann nicht rückgängig gemacht werden.
                </>
            }
            confirmLabel="Löschen"
        />
    );
}

export default DeleteLinkDialog;
