import {toast} from "sonner";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {ConfirmDialog} from "@/components/confirm-dialog.tsx";
import {AlertTriangle} from "lucide-react";
import {LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {useDeleteLink} from "@/api/linktree/hooks.ts";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: LinkItemTypeSchema
    onDeleted?: () => void
}

function DeleteLinkDialog({open, onOpenChange, currentRow, onDeleted}: Props) {
    const deleteLink = useDeleteLink();

    const handleConfirm = () => {
        deleteLink.mutate(currentRow.id, {
            onSuccess: () => {
                onOpenChange(false);
                onDeleted?.();
                toast.success('Link deleted successfully!');
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
                <span className='text-destructive'>
                  <AlertTriangle
                      className='stroke-destructive mr-1 inline-block'
                      size={18}
                  />{' '}
                    Delete Link
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to delete{' '}
                        <span className='font-bold'>{currentRow.displayname}</span>?
                        <br/>
                        This action will permanently remove the link. This cannot be undone.
                    </p>

                    <Alert variant='destructive'>
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                            Please be carefull, this operation can not be rolled back.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText={
                deleteLink.isPending ? 'Deleting...' : 'Delete'
            }
            isLoading={deleteLink.isPending}
            destructive
        />
    );
}

export default DeleteLinkDialog;
