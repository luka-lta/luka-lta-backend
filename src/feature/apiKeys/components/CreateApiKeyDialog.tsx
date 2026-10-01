import { useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Spinner } from "@/components/ui/kibo-ui/spinner/index.tsx";
import { CopyButton } from "@/components/CopyButton.tsx";
import { useCreateApiKey, usePermissions } from "@/api/apiKeys/hooks.ts";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const apiKeyCreateSchema = z.object({
    label: z.string().min(3, "Label must be at least 3 characters long"),
    origin: z.string().min(1, "Origin is required"),
});

type FormData = z.infer<typeof apiKeyCreateSchema>;

function CreateApiKeyDialog({ open, onOpenChange }: Props) {
    const form = useForm<FormData>({ resolver: zodResolver(apiKeyCreateSchema) });
    const permissions = usePermissions();
    const createApiKey = useCreateApiKey();

    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [plainKey, setPlainKey] = useState<string | null>(null);

    function togglePermission(permissionId: number, checked: boolean) {
        setSelectedPermissionIds((current) =>
            checked ? [...current, permissionId] : current.filter((id) => id !== permissionId),
        );
    }

    function handleClose(isOpen: boolean) {
        if (!isOpen) {
            form.reset();
            setSelectedPermissionIds([]);
            setPlainKey(null);
        }
        onOpenChange(isOpen);
    }

    const onSubmit: SubmitHandler<FormData> = (data) => {
        createApiKey.mutate(
            { ...data, permissionIds: selectedPermissionIds },
            {
                onSuccess: (result) => {
                    setPlainKey(result.plainKey);
                    toast.success("API key created!");
                },
                onError: (error) => toast.error(error.message),
            },
        );
    };

    if (plainKey) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>API key created</DialogTitle>
                        <DialogDescription>
                            Copy this key now — it will not be shown again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3 font-mono text-sm break-all">
                        {plainKey}
                        <CopyButton value={plainKey} />
                    </div>
                    <Alert>
                        <AlertTitle>Save it somewhere safe</AlertTitle>
                        <AlertDescription>
                            This value is only shown once. If lost, you'll need to create a new key.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button className="w-full" onClick={() => handleClose(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>
                            Create a key for an agent or integration. The Origin header must match on every request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <TextInput
                            name="label"
                            id="api-key-label-create-form"
                            label="Label"
                            form={form}
                            placeholder="Proxmox-01 Agent"
                            type="text"
                        />

                        <TextInput
                            name="origin"
                            id="api-key-origin-create-form"
                            label="Origin"
                            form={form}
                            placeholder="homelab-agent-proxmox-01"
                            type="text"
                        />

                        <div className="flex flex-col gap-2">
                            <Label>Permissions</Label>
                            <div className="flex flex-col gap-2 rounded-md border p-3">
                                {permissions.data?.map((permission) => (
                                    <div key={permission.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`permission-${permission.id}`}
                                            checked={selectedPermissionIds.includes(permission.id)}
                                            onCheckedChange={(checked) =>
                                                togglePermission(permission.id, checked === true)
                                            }
                                        />
                                        <Label htmlFor={`permission-${permission.id}`} className="font-normal">
                                            {permission.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {createApiKey.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Failed to create API key</AlertTitle>
                                <AlertDescription>{createApiKey.error.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        {createApiKey.isPending ? (
                            <Button className="w-full" disabled><Spinner size={16} />Creating key...</Button>
                        ) : (
                            <Button className="w-full" type="submit">Create API Key</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateApiKeyDialog;
