import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";
import { TextInput } from "@/components/form/TextInput.tsx";
import { IconPicker } from "@/components/IconPicker.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { LinkDetailEditSchema, LinkDetailEditTypeSchema } from "@/feature/linktree/childPages/detail/schema/LinkDetailSchema.ts";
import { useUpdateLink } from "@/api/linktree/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

function EditForm({ initialData }: { initialData: LinkItemTypeSchema }) {
    const form = useForm<LinkDetailEditTypeSchema>({
        resolver: zodResolver(LinkDetailEditSchema),
        defaultValues: {
            displayname: initialData.displayname,
            description: initialData.description ?? null,
            url: initialData.url,
            isActive: initialData.isActive,
            iconName: initialData.iconName ?? null,
        },
    });

    const editLink = useUpdateLink(initialData.id);
    const isDirty = form.formState.isDirty;

    const onSubmit: SubmitHandler<LinkDetailEditTypeSchema> = (data) => {
        editLink.mutate(data, {
            onSuccess: () => {
                form.reset(data);
                toast.success("Änderungen gespeichert");
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        });
    };

    return (
        <Card>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <CardHeader>
                    <CardTitle>Einstellungen</CardTitle>
                    <CardDescription>Name, Ziel und Darstellung auf der Link-Seite.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <TextInput name="displayname" id="link-edit-displayname" label="Name" form={form} />
                        <TextInput name="url" id="link-edit-url" label="Ziel-URL" form={form} type="url" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link-edit-description">
                            Beschreibung <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea id="link-edit-description" rows={2} {...form.register('description')} />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Icon <span className="font-normal text-muted-foreground">(optional)</span></Label>
                            <Controller
                                control={form.control}
                                name="iconName"
                                render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} />}
                            />
                        </div>
                        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="link-edit-active">Sichtbar</Label>
                                <p className="text-xs text-muted-foreground">Auf der Link-Seite anzeigen.</p>
                            </div>
                            <Controller
                                control={form.control}
                                name="isActive"
                                render={({ field }) => <Switch id="link-edit-active" checked={field.value} onCheckedChange={field.onChange} />}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t pt-4">
                    <Button type="button" variant="ghost" disabled={!isDirty || editLink.isPending} onClick={() => form.reset()}>
                        Verwerfen
                    </Button>
                    <Button type="submit" disabled={!isDirty || editLink.isPending}>
                        {editLink.isPending && <Loader2 className="animate-spin" />}
                        Speichern
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export default EditForm;
