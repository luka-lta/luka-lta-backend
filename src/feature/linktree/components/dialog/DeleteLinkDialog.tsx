import {useMutation, useQueryClient} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {ConfirmDialog} from "@/components/confirm-dialog.tsx";
import {AlertTriangle} from "lucide-react";
import {LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";

interface DeleteLinkDialogProps {
    onClose: () => void;
    link: LinkItemTypeSchema
}

function DeleteLinkDialog({onClose, link}: DeleteLinkDialogProps) {
    const queryClient = useQueryClient();

    const deleteLink = useMutation({
        mutationFn: async () => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.delete(`/linkCollection/${link.clickTag}`)
        },
        onSuccess: () => {
            onClose();
            toast.success('Link deleted successfully!');
        },
        onError: (error) => {
            toast.error(error.message);
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['linktree', 'list'],
                });
            }, 500)
        }
    })

    return (
        <ConfirmDialog
            open={true}
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                }
            }}
            handleConfirm={deleteLink.mutate}
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
                        <span className='font-bold'>{link.displayname}</span>?
                        <br/>
                        This action will permanently remove the user from the system. This cannot be undone.
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
            destructive
        />
    );
}

export default DeleteLinkDialog;