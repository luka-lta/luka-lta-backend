import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
    Dialog, DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";

interface DeleteLinkDialogProps {
    onClose: () => void;
    linkId: number;
}

function DeleteLinkDialog({onClose, linkId}: DeleteLinkDialogProps) {
    const queryClient = useQueryClient();

    const deleteLink = useMutation({
        mutationFn: async () => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.delete(`/linkCollection/${linkId}`)
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
        <Dialog open={true} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Link</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this link?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    {deleteLink.error && (
                        <Alert variant='destructive'>
                            <AlertTitle>Error, failed to delete link!</AlertTitle>
                            <AlertDescription>{deleteLink.error.message}</AlertDescription>
                        </Alert>
                    )}

                    {deleteLink.isPending ? (
                        <Button className="w-[100%]" disabled>Deleting link...</Button>
                    ) : (
                        <Button
                            className="w-[100%]"
                            type='button'
                            onClick={() => deleteLink.mutate()}
                        >
                            Delete Link
                        </Button>
                    )}
                    <Button className="w-[100%]" variant='secondary' onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteLinkDialog;