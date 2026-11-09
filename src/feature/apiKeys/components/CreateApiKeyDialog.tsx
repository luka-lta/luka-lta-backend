import { useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { CopyButton } from "@/components/CopyButton.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { useCreateApiKey, usePermissions } from "@/api/apiKeys/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const apiKeyCreateSchema = z.object({
    label: z.string().min(3, "Mindestens 3 Zeichen"),
    origin: z.string().min(1, "Origin ist erforderlich"),
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
                onSuccess: (result) => setPlainKey(result.plainKey),
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    };

    if (plainKey) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>API-Key erstellt</DialogTitle>
                        <DialogDescription>Kopiere den Key jetzt. Er wird nur dieses eine Mal angezeigt.</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3">
                        <code className="flex-1 break-all font-mono text-sm">{plainKey}</code>
                        <CopyButton value={plainKey} size={14} />
                    </div>
                    <Alert variant="warning">
                        <ShieldAlert />
                        <AlertDescription>
                            Geht der Key verloren, musst du einen neuen erstellen.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button onClick={() => handleClose(false)}>Fertig</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <FormDialog
            open={open}
            onOpenChange={handleClose}
            title="API-Key erstellen"
            description="Für Agents und Integrationen. Der Origin-Header muss bei jeder Anfrage übereinstimmen."
            onSubmit={form.handleSubmit(onSubmit)}
            submitLabel="Key erstellen"
            isSubmitting={createApiKey.isPending}
        >
            <TextInput name="label" id="api-key-label" label="Bezeichnung" form={form} placeholder="Proxmox-01 Agent" autoComplete="off" />
            <TextInput name="origin" id="api-key-origin" label="Origin" form={form} placeholder="homelab-agent-proxmox-01" autoComplete="off" />

            <fieldset className="space-y-2">
                <legend className="text-sm font-medium leading-none">Berechtigungen</legend>
                <p className="text-xs text-muted-foreground">Nur das freigeben, was die Integration wirklich braucht.</p>
                <div className="divide-y rounded-lg border">
                    {permissions.isPending && (
                        <div className="space-y-2 p-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    )}
                    {permissions.data?.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-3 px-3 py-2.5">
                            <Checkbox
                                id={`permission-${permission.id}`}
                                checked={selectedPermissionIds.includes(permission.id)}
                                onCheckedChange={(checked) => togglePermission(permission.id, checked === true)}
                            />
                            <Label htmlFor={`permission-${permission.id}`} className="flex-1 cursor-pointer font-mono text-xs font-normal">
                                {permission.name}
                            </Label>
                        </div>
                    ))}
                    {permissions.data?.length === 0 && <p className="p-3 text-sm text-muted-foreground">Keine Berechtigungen verfügbar.</p>}
                </div>
            </fieldset>
        </FormDialog>
    );
}

export default CreateApiKeyDialog;
