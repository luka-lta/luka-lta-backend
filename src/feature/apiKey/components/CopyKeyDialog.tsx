import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter, DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

interface CopyKeyDialogProps {
    onClose: () => void;
    apiKey: string;
}

function CopyKeyDialog({onClose, apiKey}: CopyKeyDialogProps) {
    return (
        <Dialog open={true} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Copy API Key</DialogTitle>
                    <DialogDescription>Copy the API key below.</DialogDescription>
                </DialogHeader>

                <Input
                    value={apiKey}
                    readOnly
                />

                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CopyKeyDialog;