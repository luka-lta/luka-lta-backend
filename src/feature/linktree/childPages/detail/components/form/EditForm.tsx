import {Button} from "@/components/ui/button.tsx";
import {
    LinkItemTypeSchema
} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {TextInput} from "@/components/form/TextInput.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {
    LinkDetailEditSchema,
    LinkDetailEditTypeSchema
} from "@/feature/linktree/childPages/detail/schema/LinkDetailSchema.ts";
import {toast} from "sonner";
import {useUpdateLink} from "@/api/linktree/hooks.ts";
import {cn} from "@/lib/utils.ts";
import {Save} from "lucide-react";
import {Spinner} from "@/components/ui/kibo-ui/spinner/index.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";

interface EditFormProps {
    initialData?: LinkItemTypeSchema
}

function EditForm({initialData}: EditFormProps) {
    const form = useForm<LinkDetailEditTypeSchema>({
        resolver: zodResolver(LinkDetailEditSchema),
        defaultValues: {
            displayname: initialData?.displayname || "",
            description: initialData?.description ?? null,
            url: initialData?.url || "",
            isActive: initialData?.isActive ?? true,
            iconName: initialData?.iconName ?? null,
        },
    });

    const editLink = useUpdateLink(initialData?.id ?? 0);

    const onSubmit: SubmitHandler<LinkDetailEditTypeSchema> = (data) => {
        editLink.mutate(data, {
            onSuccess: () => {
                form.reset(data);
                toast.success("Link updated successfully");
            },
            onError: (error) => toast.error(error.message),
        });
    };
    const isDirty = form.formState.isDirty

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit</CardTitle>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <TextInput
                        name="displayname"
                        id="link-detail-edit-displayname"
                        label="Display Name"
                        form={form}
                        type="text"
                        placeholder="Enter a name for your link"
                    />

                    <div className="flex flex-col items-start gap-2">
                        <Label htmlFor="link-detail-edit-description">Description</Label>
                        <Textarea
                            id="link-detail-edit-description"
                            placeholder="Link description"
                            {...form.register('description')}
                        />
                    </div>

                    <TextInput
                        name="url"
                        id="link-detail-edit-url"
                        label="URL"
                        form={form}
                        type="url"
                        placeholder="https://example.com"
                    />

                    <TextInput
                        name="iconName"
                        id="link-detail-edit-iconName"
                        label="Icon"
                        form={form}
                        type="text"
                        placeholder="FaGithub"
                    />

                    <Separator />

                    <div className="flex items-center justify-between">
                        <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                            Active Status
                        </Label>
                        <Controller
                            control={form.control}
                            name="isActive"
                            render={({field}) => (
                                <Switch
                                    id="active"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className={cn(field.value ? "bg-green-500" : "bg-gray-300")}
                                />
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={editLink.isPending || !isDirty}
                        className="w-full"
                        variant={isDirty ? "default" : "outline"}
                    >
                        {editLink.isPending ? (
                            <>
                                <Spinner size={16} className="mr-2" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isDirty ? "Save Changes" : "No Changes"}
                            </>
                        )}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}

export default EditForm;