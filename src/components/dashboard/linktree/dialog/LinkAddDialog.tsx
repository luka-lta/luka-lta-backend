import useLinkStore from "@/stores/LinkStore.ts";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {useCallback} from "react";
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import {LinkForm} from "@/components/dashboard/linktree/form/LinkForm.tsx";

interface LinkFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function LinkAddDialog({open, onOpenChange}: LinkFormDialogProps) {
    const {addLink, fetchLinks, isLoading} = useLinkStore();

    const handleSubmit = useCallback(async (values: LinkItemTypeSchema) => {
        try {
            await addLink(values);
            await fetchLinks();
            toast.success("Link created successfully!");
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating link:", error);
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
        }
    }, [addLink, fetchLinks, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Link</DialogTitle>
                    <DialogDescription>
                        Create an external link to your social media or website.
                    </DialogDescription>
                </DialogHeader>

                <LinkForm onSubmit={handleSubmit} isLoading={isLoading} onOpenChange={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
}

export default LinkAddDialog;
