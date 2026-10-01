import {toast} from "sonner";
import {ConfirmDialog} from "@/components/confirm-dialog.tsx";
import {PowerOff} from "lucide-react";
import {LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {useDeactivateLink} from "@/api/linktree/hooks.ts";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: LinkItemTypeSchema
}

function DeactivateLinkDialog({open, onOpenChange, currentRow}: Props) {
    const deactivateLink = useDeactivateLink();

    const handleConfirm = () => {
        deactivateLink.mutate(currentRow.id, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Link deactivated successfully!');
            },
            onError: (error) => {
                toast.error(error.message);
                console.error(error);
            },
        });
    };

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleConfirm}
            title={
                <span className='flex items-center gap-1'>
                    <PowerOff className='inline-block' size={18}/>
                    Deactivate Link
                </span>
            }
            desc={
                <p>
                    Are you sure you want to deactivate{' '}
                    <span className='font-bold'>{currentRow.displayname}</span>?
                    <br/>
                    The link will stop redirecting visitors, but stays visible here. This cannot be undone.
                </p>
            }
            confirmText={
                deactivateLink.isPending ? 'Deactivating...' : 'Deactivate'
            }
            isLoading={deactivateLink.isPending}
        />
    );
}

export default DeactivateLinkDialog;
