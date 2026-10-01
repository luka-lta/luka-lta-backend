import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { ConfirmDialog } from "@/components/confirm-dialog.tsx";
import { AlertTriangle } from "lucide-react";
import { ApiKeyType } from "@/api/apiKeys/schema.ts";
import { useDeleteApiKey } from "@/api/apiKeys/hooks.ts";

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
                toast.success("API key deleted!");
            },
            onError: (error) => toast.error(error.message),
        });
    };

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleConfirm}
            title={
                <span className="text-destructive">
                    <AlertTriangle className="stroke-destructive mr-1 inline-block" size={18} />{" "}
                    Delete API Key
                </span>
            }
            desc={
                <div className="space-y-4">
                    <p>
                        Are you sure you want to delete <span className="font-bold">{currentRow.label}</span>?
                        <br />
                        Any agent or integration using this key will stop working immediately.
                    </p>
                    <Alert variant="destructive">
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>This operation cannot be rolled back.</AlertDescription>
                    </Alert>
                </div>
            }
            confirmText={deleteApiKey.isPending ? "Deleting..." : "Delete"}
            isLoading={deleteApiKey.isPending}
            destructive
        />
    );
}

export default DeleteApiKeyDialog;
