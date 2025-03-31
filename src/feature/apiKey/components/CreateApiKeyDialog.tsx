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
import {Button} from "@/components/ui/button.tsx";
import {CalendarInput} from "@/components/form/CalendarInput.tsx";
import {useState} from "react";
import CopyKeyDialog from "@/feature/apiKey/components/CopyKeyDialog.tsx";
import {PermissionsSelector} from "@/components/dashboard/PermissionsSelector.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";

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

function CreateApiKeyDialog({onClose}: CreateApiKeyDialogProps) {
    const queryClient = useQueryClient();
    const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)

    const form = useForm<createApiKeyData>({
        resolver: zodResolver(createApiKeySchema),
    })

    const createApiKey = useMutation({
        mutationFn: async ({origin, permissions, expiresAt}: createApiKeyData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            return await fetchWrapper.post("/key/", {
                origin,
                permissions,
                expiresAt,
            }) // Assuming the API returns the created key
        },
        onSuccess: (data) => {
            toast.success("Api-Key created successfully!")
            setCreatedApiKey(data.data.apiKey.apiKey)


            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ["apikey", "list"],
                })
            }, 500)
        },
        onError: (error) => {
            toast.error(error.message);
            console.error(error);
        }
    })

    const onSubmit: SubmitHandler<createApiKeyData> = (data) => createApiKey.mutate(data);

    if (createdApiKey) {
        return <CopyKeyDialog apiKey={createdApiKey} onClose={onClose}/>
    }

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

                        <PermissionsSelector form={form} />

                        <CalendarInput
                            name={'expiresAt'}
                            id={'apikey-expiry-create-form'}
                            label={'Expires At'}
                            form={form}
                            placeholder={'Select Expiry Date'}
                        />

                        {createApiKey.error && (
                            <Alert variant='destructive'>
                                <AlertTitle>Error, failed to create link!</AlertTitle>
                                <AlertDescription>{createApiKey.error.message}</AlertDescription>
                            </Alert>
                        )}
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