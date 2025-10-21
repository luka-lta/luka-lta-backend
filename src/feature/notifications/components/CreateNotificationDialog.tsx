import {
    notificationCreateSchema,
} from "@/feature/notifications/schema/NotificationSchema.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SubmitHandler, useForm} from "react-hook-form";
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
import {Button} from "@/components/ui/button.tsx";
import {ProviderSelector} from "@/feature/notifications/components/ProviderSelector.tsx";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export type notificationData = {
    name: string,
    url: string,
    providers: string[]
}

function CreateNotificationDialog({ open, onOpenChange}: Props) {
    const queryClient = useQueryClient();

    const form = useForm<notificationData>({
        resolver: zodResolver(notificationCreateSchema)
    });

    const createNotification = useMutation({
        mutationFn: async ({name, url, providers}: notificationData) => {
            console.log(name, url, providers)
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post('/user/', {
                name,
                url,
                providers,
            })
        },
        onSuccess: () => {
            onOpenChange(false);
            form.reset()
            toast.success('Notification created successfully!');
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['notifications', 'list'], //TODO Change
                });
            }, 500)
        }
    })

    const onSubmit: SubmitHandler<notificationData> = (data) => createNotification.mutate(data);

    console.log(form.formState.errors)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create a new Notification</DialogTitle>
                        <DialogDescription>Create a new Notification for a RSS Feed</DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-6 py-6'>
                        <TextInput
                            name={'name'}
                            id={'notification-name-create-form'}
                            label={'Name'}
                            form={form}
                            placeholder={'Tech News'}
                            type={'text'}
                        />

                        <TextInput
                            name={'url'}
                            id={'notification-url-create-form'}
                            label={'URL'}
                            form={form}
                            placeholder={'https://example.com/news.rss'}
                            type={'url'}
                        />

                        <ProviderSelector form={form} />
                    </div>

                    <DialogFooter>
                        {createNotification.isPending ? (
                            <Button className="w-[100%]" disabled>Creating Notification...</Button>
                        ) : (
                            <Button className="w-[100%]" type='submit'>Create Notification</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateNotificationDialog;