import {toast} from "sonner";
import {ConfirmDialog} from "@/components/confirm-dialog.tsx";
import {Power} from "lucide-react";
import {LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {useActivateLink} from "@/api/linktree/hooks.ts";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: LinkItemTypeSchema
}

function ActivateLinkDialog({open, onOpenChange, currentRow}: Props) {
    const activateLink = useActivateLink();

    const handleConfirm = () => {
        activateLink.mutate(currentRow.id, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Link activated successfully!');
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
                    <Power className='inline-block' size={18}/>
                    Activate Link
                </span>
            }
            desc={
                <p>
                    Are you sure you want to activate{' '}
                    <span className='font-bold'>{currentRow.displayname}</span>?
                    <br/>
                    The link will start redirecting visitors again.
                </p>
            }
            confirmText={
                activateLink.isPending ? 'Activating...' : 'Activate'
            }
            isLoading={activateLink.isPending}
        />
    );
}

export default ActivateLinkDialog;
