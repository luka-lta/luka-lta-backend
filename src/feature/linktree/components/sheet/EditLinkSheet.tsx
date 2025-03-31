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
import {Separator} from "@/components/ui/separator.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {IdCard, Tag} from "lucide-react";

const linkEditSchema = z.object({
    displayname: z.string().nonempty().min(1).max(255),
    description: z.string().nullable().default(null),
    url: z.string().url(),
    isActive: z.boolean().default(true),
    iconName: z.string().nullable().default(null),
})

type EditLinkDialogProps = {
    link: LinkItemTypeSchema,
    onClose: () => void,
}

function EditLinkSheet({onClose, link}: EditLinkDialogProps) {
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
            const errorMessage = error.message;

            if (errorMessage.includes('Icon')) {
                form.setError('iconName', {
                    type: 'manual',
                    message: errorMessage
                });
            }

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
                        <SheetDescription>Make changes to your link</SheetDescription>
                    </SheetHeader>

                    <Separator className='mt-3' />

                    <div className='py-6 space-y-6'>
                        <Card className="border-dashed">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                    <Tag className="h-4 w-4" />
                                    <span>
                                      Click Tag: <span className="font-mono">{link.clickTag}</span>
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <IdCard className="h-4 w-4" />
                                    <span>ID: {link.id}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Link Information</h3>

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
                        </div>


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

export default EditLinkSheet;