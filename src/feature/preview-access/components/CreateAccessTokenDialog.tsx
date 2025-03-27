import {z} from "zod";
import React from "react";
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
import {Label} from "@/components/ui/label.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button.tsx";

const accessTokenCreateSchema = z.object({
    maxUse: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, {message: "Max use must be a positive number"})
        .optional()
        .default('1'), isActive: z.boolean().optional().default(true),
});

type CreateAccessTokenDialogProps = {
    onClose: () => void,
}

interface createAccessTokenData {
    maxUse?: number,
    isActive?: boolean,
}

export const CreateAccessTokenDialog: React.FC<CreateAccessTokenDialogProps> = ({onClose}) => {
    const queryClient = useQueryClient();

    const form = useForm<createAccessTokenData>({
        resolver: zodResolver(accessTokenCreateSchema),
    });

    const createPreviewToken = useMutation({
        mutationFn: async ({maxUse, isActive}: createAccessTokenData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post('/previewToken/', {
                maxUse: Number(maxUse),
                isActive,
            })
        },
        onSuccess: () => {
            onClose();
            toast.success('Preview token created successfully!');
        },
        onError: (error) => {
            toast.error('Failed to create link');
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['access', 'tokens', 'list'],
                });
            }, 500)
        }
    });

    const onSubmit: SubmitHandler<createAccessTokenData> = (data) => createPreviewToken.mutate(data);

    return (
        <Dialog open={true} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create Preview-Token</DialogTitle>
                        <DialogDescription>Create a new Preview-Token</DialogDescription>
                    </DialogHeader>

                    <div className='grid gap-6 py-6'>
                        <TextInput
                            name={'maxUse'}
                            id={'preview-token-max-uses-create-form'}
                            label={'Max Uses'}
                            form={form}
                            placeholder='Default: 1'
                            type={'number'}
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

                        {createPreviewToken.error && (
                            <Alert variant='destructive'>
                                <AlertTitle>Error, failed to create preview-token!</AlertTitle>
                                <AlertDescription>{createPreviewToken.error.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        {createPreviewToken.isPending ? (
                            <Button className="w-[100%]" disabled>Creating token...</Button>
                        ) : (
                            <Button className="w-[100%]" type='submit'>Create token</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateAccessTokenDialog;