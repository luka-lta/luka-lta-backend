import {z} from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {zodResolver} from "@hookform/resolvers/zod";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {TextInput} from "@/components/form/TextInput.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {linkData} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";

const linkCreateSchema = z.object({
    displayname: z.string().nonempty().min(1).max(255),
    description: z.string().nullable().default(null),
    url: z.string().url(),
    isActive: z.boolean().default(true),
    iconName: z.string().nullable().default(null),
})

interface Props {
    currentRow?: UserTypeSchema
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateLinkDialog({ open, onOpenChange }: Props) {
    const queryClient = useQueryClient();

    const form = useForm<linkData>({
        resolver: zodResolver(linkCreateSchema),
    });

    const createLink = useMutation({
        mutationFn: async ({displayname, description, iconName, isActive, url}: linkData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post('/linkCollection/', {
                displayname,
                description,
                iconName,
                isActive,
                url,
            })
        },
        onSuccess: () => {
            onOpenChange(false);
            form.reset()
            toast.success('Link created successfully!');
        },
        onError: (error) => {
            const errorMessage = error.message;

            if (errorMessage.includes('Icon')) {
                form.setError('iconName', {
                    type: 'manual',
                    message: errorMessage
                });
            }

            toast.error(errorMessage);
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['linktree', 'list'],
                });
            }, 500)
        }
    })

    const onSubmit: SubmitHandler<linkData> = (data) => createLink.mutate(data);

    return (
        <Dialog open={open} onOpenChange={() => {
            onOpenChange(false);
            form.reset();
        }}>
            <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create Link</DialogTitle>
                        <DialogDescription>Create a new Link for linktree</DialogDescription>
                    </DialogHeader>
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

                        {createLink.error && (
                            <Alert variant='destructive'>
                                <AlertTitle>Error, failed to create link!</AlertTitle>
                                <AlertDescription>{createLink.error.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        {createLink.isPending ? (
                            <Button className="w-[100%]" disabled>Creating link...</Button>
                        ) : (
                            <Button className="w-[100%]" type='submit'>Create Link</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

