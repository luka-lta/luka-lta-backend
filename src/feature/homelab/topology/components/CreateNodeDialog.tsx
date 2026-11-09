import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { NODE_TYPE_CONFIG } from "@/feature/homelab/topology/constants.ts";
import { useCreateTopologyNode } from "@/api/homelab/topologyHooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

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
                    toast.success("Knoten angelegt");
                    setName("");
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            title="Knoten hinzufügen"
            description="Für Infrastruktur ohne Monitoring, z. B. Internet oder Cloudflare."
            onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
            }}
            submitLabel="Hinzufügen"
            isSubmitting={createNode.isPending}
            submitDisabled={!name.trim()}
        >
            <div className="space-y-2">
                <Label htmlFor="node-name">Name</Label>
                <Input id="node-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Internet" autoFocus />
            </div>
            <div className="space-y-2">
                <Label htmlFor="node-type">Typ</Label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="node-type">
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
        </FormDialog>
    );
}

export default CreateNodeDialog;
