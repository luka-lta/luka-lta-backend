import {TextInput} from "@/components/form/TextInput.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button.tsx";
import {linkData, LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet.tsx";

const linkEditSchema = z.object({
    displayname: z.string().min(1),
    description: z.string().nullable().default(null),
    url: z.string().url(),
    isActive: z.boolean().default(true),
    iconName: z.string().nullable().default(null),
})

type EditLinkDialogProps = {
    link: LinkItemTypeSchema,
    onClose: () => void,
}

function EditLinkDialog({onClose, link}: EditLinkDialogProps) {
    const queryClient = useQueryClient();

    const form = useForm<linkData>({
        resolver: zodResolver(linkEditSchema),
        defaultValues: {
            displayname: link.displayname,
            description: link.description ?? '',
            url: link.url,
            isActive: link.isActive,
            iconName: link.iconName ?? '',
        }
    });

    const editLink = useMutation({
        mutationFn: async ({displayname, description, iconName, isActive, url}: linkData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.put(`/linkCollection/${link.id}`, {
                displayname,
                description,
                iconName,
                isActive,
                url,
            })
        },
        onSuccess: () => {
            onClose();
            toast.success('Link edited successfully!');
        },
        onError: (error) => {
            toast.error('Failed to edit link');
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['linktree', 'list'],
                });
            }, 500)
        }
    });

    const onSubmit: SubmitHandler<linkData> = (data) => editLink.mutate(data);

    return (
        <Sheet open={true} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <SheetContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <SheetHeader>
                        <SheetTitle>Edit Link</SheetTitle>
                        <SheetDescription>Edit a new Link for linktree</SheetDescription>
                    </SheetHeader>
                    <div className='grid gap-6 py-6'>
                        <TextInput
                            name={'displayname'}
                            id={'link-displayname-create-form'}
                            label={'Display Name'}
                            form={form}
                            placeholder='My link'
                            type={'text'}
                        />

                        <div className="flex flex-col items-start gap-2">
                            <Label htmlFor="link-description-creat-form">Description</Label>
                            <Textarea
                                id={'link-description-creat-form'}
                                placeholder={'Link description'}
                                {...form.register('description')}
                                onChange={(e) => form.setValue('description', e.target.value)}
                            />
                        </div>

                        <TextInput
                            name={'url'}
                            id={'link-url-create-form'}
                            label={'URL'}
                            form={form}
                            placeholder='https://mylink.com/'
                            type={'url'}
                        />

                        <TextInput
                            name={'iconName'}
                            id={'link-iconName-create-form'}
                            label={'Icon'}
                            form={form}
                            placeholder='FaGithub'
                            type={'text'}
                        />

                        <div className="flex flex-col items-start gap-2">
                            <Label htmlFor="active">Active</Label>
                            <Switch
                                id="isActive"
                                {...form.register('isActive')}
                                onCheckedChange={(value) => form.setValue('isActive', value)}
                                defaultChecked={form.getValues('isActive')}
                            />
                        </div>

                        {editLink.error && (
                            <Alert variant='destructive'>
                                <AlertTitle>Error, failed to edit link!</AlertTitle>
                                <AlertDescription>{editLink.error.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <SheetFooter>
                        {editLink.isPending || form.formState.isDirty ? (
                            <Button className="w-[100%]" disabled>Editing link...</Button>
                        ) : (
                            <Button className="w-[100%]" type='submit'>Editing Link</Button>
                        )}
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

export default EditLinkDialog;