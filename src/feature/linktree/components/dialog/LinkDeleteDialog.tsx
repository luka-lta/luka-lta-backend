import useLinkStore from "@/stores/LinkStore.ts";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import {Button} from "@/components/ui/button.tsx";

interface LinkDeleteDialogProps {
    currentLink: LinkItemTypeSchema | undefined;
    open: boolean;
    setOpen: (isOpen: boolean) => void;
}

function LinkDeleteDialog({ currentLink, open, setOpen }: LinkDeleteDialogProps) {
    const {deleteLink, isLoading} = useLinkStore();

    const onSubmit = async () => {
        if (!currentLink) return;

        try {
            await deleteLink(currentLink.id);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Link</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this link? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {currentLink && (
                    <div className="py-4">
                        <p className="font-medium">{currentLink.displayname}</p>
                        <p className="text-muted-foreground">{currentLink.url}</p>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onSubmit}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default LinkDeleteDialog;