import {z} from "zod";
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
import {MultiSelect} from "@/components/ui/multi-select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {CalendarInput} from "@/components/form/CalendarInput.tsx";

interface CreateApiKeyDialogProps {
    onClose: () => void;
}

const createApiKeySchema = z.object({
    origin: z.string().url().nonempty(),
    permissions: z.array(z.number()).default([]),
    expiresAt: z.date().optional(),
});

type createApiKeyData = {
    origin: string,
    permissions: number[] | null,
    expiresAt: Date | undefined,
}

const permissionsList = [
    {value: "1", label: 'Create Links'},
    {value: "2", label: 'Delete Links'},
    {value: "3", label: 'Edit Links'},
    {value: "4", label: 'Read Links'},
]

function CreateApiKeyDialog({onClose}: CreateApiKeyDialogProps) {
    const queryClient = useQueryClient();

    const form = useForm<createApiKeyData>({
        resolver: zodResolver(createApiKeySchema),
    })

    const createApiKey = useMutation({
        mutationFn: async ({origin, permissions, expiresAt}: createApiKeyData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post('/key/', {
                origin,
                permissions,
                expiresAt,
            })
        },
        onSuccess: () => {
            onClose();
            toast.success('Api-Key created successfully!');
        },
        onError: (error) => {
            toast.error('Failed to create Api-Key');
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['apikey', 'list'],
                });
            }, 500)
        }
    })

    const onSubmit: SubmitHandler<createApiKeyData> = (data) => createApiKey.mutate(data);

    return (
        <Dialog open={true} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create Api-Key</DialogTitle>
                        <DialogDescription>Create a new api-key for access api</DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-6 py-6'>
                        <TextInput
                            name={'origin'}
                            id={'apikey-origin-create-form'}
                            label={'Origin'}
                            form={form}
                            placeholder='exmaple.com'
                            type={'text'}
                        />
                        <div className="flex flex-col items-start gap-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="apikey-permissions-create-form"
                                       className="text-sm font-medium cursor-pointer">
                                    Active Status
                                </Label>
                            </div>
                            <MultiSelect
                                id='apikey-permissions-create-form'
                                options={permissionsList}
                                onValueChange={(value) => {
                                    const numberValues = value.map(v => parseInt(v, 10));
                                    form.setValue('permissions', numberValues);
                                }}
                                placeholder={'Select Permissions'}
                            />
                        </div>

                        <CalendarInput
                            name={'expiresAt'}
                            id={'apikey-expiry-create-form'}
                            label={'Expires At'}
                            form={form}
                            placeholder={'Select Expiry Date'}
                        />
                    </div>
                    <DialogFooter>
                        {createApiKey.isPending ? (
                            <Button className="w-[100%]" disabled>Creating key...</Button>
                        ) : (
                            <Button className="w-[100%]" type='submit'>Create key</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateApiKeyDialog;