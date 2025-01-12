import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import useLinkStore from "@/stores/LinkStore.ts";
import {toast} from "sonner";

interface LinkDeleteDialogProps {
    id: number;
    open: boolean;
    setOpen: (isOpen: boolean) => void;
}

function LinkDeleteDialog({ id, open, setOpen }: LinkDeleteDialogProps) {
    const {deleteLink, isLoading} = useLinkStore();

    const onSubmit = async () => {
        try {
            await deleteLink(id);
            toast.success("Link deleted successfully!");
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error deleting link:", error);
                toast.error(error.message);
            }
        }
        setOpen(false);
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will deactivate the link and remove it from your linktree.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubmit}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default LinkDeleteDialog;