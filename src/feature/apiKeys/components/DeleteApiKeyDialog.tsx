import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { ApiKeyType } from "@/api/apiKeys/schema.ts";
import { useDeleteApiKey } from "@/api/apiKeys/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow: ApiKeyType;
}

function DeleteApiKeyDialog({ open, onOpenChange, currentRow }: Props) {
    const deleteApiKey = useDeleteApiKey();

    const handleConfirm = () => {
        deleteApiKey.mutate(currentRow.id, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success("API-Key gelöscht");
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        });
    };

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handleConfirm}
            isLoading={deleteApiKey.isPending}
            destructive
            title="API-Key löschen?"
            description={
                <>
                    <span className="font-medium text-foreground">{currentRow.label}</span> wird sofort ungültig.
                    Agents und Integrationen mit diesem Key funktionieren danach nicht mehr.
                </>
            }
            confirmLabel="Löschen"
        />
    );
}

export default DeleteApiKeyDialog;
