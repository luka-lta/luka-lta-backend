import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TextInput } from "@/components/form/TextInput.tsx";
import { IconPicker } from "@/components/IconPicker.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { linkData } from "@/feature/linktree/schema/LinktreeSchema.ts";
import { useCreateLink } from "@/api/linktree/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

const linkCreateSchema = z.object({
    displayname: z.string().min(1, "Name ist erforderlich").max(255),
    description: z.string().nullable().default(null),
    url: z.string().url("Keine gültige URL (inkl. https://)"),
    isActive: z.boolean().default(true),
    iconName: z.string().nullable().default(null),
})

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateLinkDialog({ open, onOpenChange }: Props) {
    const form = useForm<linkData>({
        resolver: zodResolver(linkCreateSchema),
        defaultValues: { isActive: true },
    });
    const createLink = useCreateLink();

    const onSubmit: SubmitHandler<linkData> = (data) => {
        createLink.mutate(data, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
                toast.success('Link angelegt');
            },
            onError: (error) => {
                const message = getApiErrorMessage(error);
                if (message.includes('Icon')) form.setError('iconName', { type: 'manual', message });
                else toast.error(message);
            },
        });
    };

    return (
        <FormDialog
            open={open}
            onOpenChange={(next) => { if (!next) form.reset(); onOpenChange(next); }}
            title="Link anlegen"
            description="Erscheint auf deiner Link-Seite und wird über einen Kurz-Tag getrackt."
            onSubmit={form.handleSubmit(onSubmit)}
            submitLabel="Link anlegen"
            isSubmitting={createLink.isPending}
        >
            <TextInput name="displayname" id="link-displayname-create" label="Name" form={form} placeholder="Mein GitHub" autoComplete="off" />
            <TextInput name="url" id="link-url-create" label="Ziel-URL" form={form} placeholder="https://github.com/…" type="url" />

            <div className="space-y-2">
                <Label htmlFor="link-description-create">
                    Beschreibung <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea id="link-description-create" rows={2} {...form.register('description')} />
            </div>

            <div className="space-y-2">
                <Label>Icon <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Controller
                    control={form.control}
                    name="iconName"
                    render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} />}
                />
                {form.formState.errors.iconName && (
                    <p className="text-xs font-medium text-destructive">{form.formState.errors.iconName.message}</p>
                )}
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor="link-active-create">Sichtbar</Label>
                    <p className="text-xs text-muted-foreground">Auf der öffentlichen Link-Seite anzeigen.</p>
                </div>
                <Controller
                    control={form.control}
                    name="isActive"
                    render={({ field }) => <Switch id="link-active-create" checked={field.value} onCheckedChange={field.onChange} />}
                />
            </div>
        </FormDialog>
    );
}
