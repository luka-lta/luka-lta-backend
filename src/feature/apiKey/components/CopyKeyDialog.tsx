import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter, DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useCallback, useState} from "react";
import {toast} from "sonner";
import {Check, Copy} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface CopyKeyDialogProps {
    onClose: () => void;
    apiKey: string;
}

function CopyKeyDialog({onClose, apiKey}: CopyKeyDialogProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(apiKey).then(() => {
            setCopied(true);
            toast.success("Api-Key copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        });
    }, [apiKey]);

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

                <div className="flex space-x-2">
                    <Input
                        value={apiKey}
                        readOnly
                        className="font-mono"
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={copyToClipboard} variant="outline" size="icon">
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{copied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CopyKeyDialog;