import {Button} from "@/components/ui/button.tsx";
import {
    LinkItemTypeSchema
} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {TextInput} from "@/components/form/TextInput.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
    LinkDetailEditSchema,
    LinkDetailEditTypeSchema
} from "@/feature/linktree/childPages/detail/schema/LinkDetailSchema.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";
import {cn} from "@/lib/utils.ts";
import {Loader2, Save} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";

interface EditFormProps {
    initialData?: LinkItemTypeSchema
}

function EditForm({initialData}: EditFormProps) {
    const queryClient = useQueryClient();
    const form = useForm<LinkDetailEditTypeSchema>({
        resolver: zodResolver(LinkDetailEditSchema),
        defaultValues: {
            displayname: initialData?.displayname || "",
            url: initialData?.url || "",
            isActive: initialData?.isActive ?? true,
        },
    });

    const editLink = useMutation({
        mutationFn: async ({displayname, url, isActive}: LinkDetailEditTypeSchema) => {
            const linkId = initialData?.id;

            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.put(`/linkCollection/${linkId}`, {
                displayname,
                url,
                isActive,
            });
        },
        onSuccess: () => {
            toast.success("Link updated successfully");
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({queryKey: ['linktree', 'detail', initialData?.id]});
            }, 500);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })

    const onSubmit: SubmitHandler<LinkDetailEditTypeSchema> = (data) => editLink.mutate(data);
    const isDirty = form.formState.isDirty

    return (
        <div className="">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="px-5 py-4 space-y-4">
                    <div className="space-y-4">
                        <TextInput
                            name="displayname"
                            id="link-detail-edit-displayname"
                            label="Display Name"
                            form={form}
                            type="text"
                            placeholder="Enter a name for your link"
                        />

                        <TextInput
                            name="url"
                            id="link-detail-edit-url"
                            label="URL"
                            form={form}
                            type="url"
                            placeholder="https://example.com"
                        />
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                                Active Status
                            </Label>
                        </div>
                        <Switch
                            id="active"
                            {...form.register("isActive")}
                            onCheckedChange={(value) => form.setValue("isActive", value, { shouldDirty: true })}
                            checked={form.watch("isActive")}
                            className={cn(form.watch("isActive") ? "bg-green-500" : "bg-gray-300")}
                        />
                    </div>
                </div>

                <div className="px-5 pt-0">
                    <Button
                        type="submit"
                        disabled={editLink.isPending || !isDirty}
                        className="w-full"
                        variant={isDirty ? "default" : "outline"}
                    >
                        {editLink.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isDirty ? "Save Changes" : "No Changes"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default EditForm;