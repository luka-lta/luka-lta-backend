import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { NODE_TYPE_CONFIG } from "@/feature/homelab/topology/constants.ts";
import { useCreateTopologyNode } from "@/api/homelab/topologyHooks.ts";

interface CreateNodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function CreateNodeDialog({ open, onOpenChange }: CreateNodeDialogProps) {
    const [type, setType] = useState("internet");
    const [name, setName] = useState("");
    const createNode = useCreateTopologyNode();

    function handleSubmit() {
        if (!name.trim()) return;

        createNode.mutate(
            { type, name: name.trim(), status: "healthy" },
            {
                onSuccess: () => {
                    toast.success("Node created.");
                    setName("");
                    onOpenChange(false);
                },
                onError: (error) => toast.error(error.message),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add infrastructure node</DialogTitle>
                    <DialogDescription>
                        For infrastructure that isn't a monitored host or container — e.g. Internet, Cloudflare.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="node-name">Name</Label>
                        <Input id="node-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Internet" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button className="w-full" onClick={handleSubmit} disabled={createNode.isPending || !name.trim()}>
                        Add node
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CreateNodeDialog;
