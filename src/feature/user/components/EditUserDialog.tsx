import {z} from "zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button.tsx";
import {TextInput} from "@/components/form/TextInput.tsx";
import {AvatarInput} from "@/components/form/AvatarInput.tsx";

interface EditUserDialogProps {
    onClose: () => void;
    user: UserTypeSchema;
}

const userEditSchema = z.object({
    email: z.string().email(),
    avatar: z.any().nullable()
})

export type userData = {
    email: string,
    avatar: File | null,
}

function EditUserDialog({onClose, user}: EditUserDialogProps) {
    const queryClient = useQueryClient();

    const form = useForm<userData>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            email: user.email,
            avatar: null,
        }
    });

    const editUser = useMutation({
        mutationFn: async ({email, avatar}: userData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.put(`/user/${user.userId}`, {
                email,
                avatar,
            })
        },
        onSuccess: () => {
            onClose();
            toast.success('User edited successfully!');
        },
        onError: (error) => {
            toast.error('Failed to edit User');
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['users', 'list'],
                });
            }, 500)
        }
    })

    const onSubmit: SubmitHandler<userData> = (data) => editUser.mutate(data);

    return (
        <Dialog open={true} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create User</DialogTitle>
                        <DialogDescription>Create a new user for backend</DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-6 py-6'>

                        <TextInput
                            name={'email'}
                            id={'user-email-edit-form'}
                            label={'Email'}
                            form={form}
                            placeholder='peter@mail.com'
                            type={'text'}
                        />

                        <AvatarInput
                            name={'avatar'}
                            id={'user-avatar-edit-form'}
                            label={'Avatar'}
                            form={form}
                        />

                        {editUser.error && (
                            <Alert variant='destructive'>
                                <AlertTitle>Error, failed to edit user!</AlertTitle>
                                <AlertDescription>{editUser.error.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        {editUser.isPending ? (
                            <Button className="w-[100%]" disabled>Editing user...</Button>
                        ) : (
                            <Button className="w-[100%]" type='submit'>Edit User</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditUserDialog;