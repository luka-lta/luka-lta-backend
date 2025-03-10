import BaseDialog from "@/components/dialog/BaseDialog.tsx";
import {Button} from "@/components/ui/button.tsx";

interface DeleteDialogProps {
    type: string;
    open: boolean;
    isLoading: boolean;
    setOpen: (isOpen: boolean) => void;
    onDelete: () => void;
}

function DeleteDialog({ type, open, setOpen, onDelete, isLoading }: DeleteDialogProps) {
    return (
        <BaseDialog
            title={`Delete ${type}`}
            description={`Are you sure you want to delete this ${type}? This action cannot be undone.`}
            open={open}
            setOpen={setOpen}
            footer={
                <>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </>
            }
        />
    );
}

export default DeleteDialog;
