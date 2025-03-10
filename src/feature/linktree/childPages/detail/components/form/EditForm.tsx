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

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl shadow-md">
            <div className="space-y-4">
                <TextInput
                    name="displayname"
                    id="link-detail-edit-displayname"
                    label="Displayname"
                    form={form}
                    type="text"
                />

                <TextInput
                    name="url"
                    id="link-detail-edit-url"
                    label="URL"
                    form={form}
                    type="url"
                />
            </div>

            <div className="flex items-center gap-3">
                <Switch
                    id="active"
                    {...form.register('isActive')}
                    onCheckedChange={(value) => form.setValue('isActive', value)}
                    defaultChecked={form.getValues('isActive')}
                />
                <Label htmlFor="active">Active</Label>
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={editLink.isPending}
                    className="w-full"
                >
                    {editLink.isPending ? "Updating Link..." : "Update"}
                </Button>
            </div>
        </form>
    );
}

export default EditForm;