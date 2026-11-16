import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";
import { useDeactivateLink } from "@/api/linktree/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: LinkItemTypeSchema
}

function DeactivateLinkDialog({ open, onOpenChange, currentRow }: Props) {
    const deactivateLink = useDeactivateLink();

    const handleConfirm = () => {
        deactivateLink.mutate(currentRow.id, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Link deaktiviert');
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        });
    };

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handleConfirm}
            isLoading={deactivateLink.isPending}
            title="Link deaktivieren?"
            description={
                <>
                    <span className="font-medium text-foreground">{currentRow.displayname}</span> leitet Besucher dann
                    nicht mehr weiter. Du kannst ihn jederzeit wieder aktivieren.
                </>
            }
            confirmLabel="Deaktivieren"
        />
    );
}

export default DeactivateLinkDialog;
