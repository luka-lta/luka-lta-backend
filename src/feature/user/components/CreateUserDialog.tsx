import {useMutation, useQueryClient} from "@tanstack/react-query";
import {z} from "zod";
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
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";

interface CreateUserDialogProps {
    onClose: () => void;
}

const userCreateSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    repeatPassword: z.string().min(8, "Password must be at least 8 characters long"),
})
    .refine(data => data.password === data.repeatPassword, {
        path: ["repeatPassword"],
        message: "Passwords do not match",
    })

export type userData = {
    username: string,
    email: string,
    password: string,
    repeatPassword: string,
}

function CreateUserDialog({onClose}: CreateUserDialogProps) {
    const queryClient = useQueryClient();

    const form = useForm<userData>({
        resolver: zodResolver(userCreateSchema),
    });

    const createUser = useMutation({
        mutationFn: async ({username, email, password}: userData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post('/user/', {
                username,
                email,
                password,
            })
        },
        onSuccess: () => {
            onClose();
            toast.success('User created successfully!');
        },
        onError: (error) => {
            const errorMessage = error.message;
            if (errorMessage.includes('email')) {
                form.setError('email', {
                    type: 'manual',
                    message: errorMessage,
                });
            }

            if (errorMessage.includes('username')) {
                form.setError('username', {
                    type: 'manual',
                    message: errorMessage,
                });
            }

            toast.error('Failed to create user');
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

    const onSubmit: SubmitHandler<userData> = (data) => createUser.mutate(data);

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
                            id={'user-email-create-form'}
                            label={'Email'}
                            form={form}
                            placeholder='peter@mail.com'
                            type={'text'}
                        />

                        <TextInput
                            name={'username'}
                            id={'user-username-create-form'}
                            label={'Username'}
                            form={form}
                            placeholder='e.xample'
                            type={'text'}
                        />

                        <TextInput
                            name={'password'}
                            id={'user-password-create-form'}
                            label={'Password'}
                            form={form}
                            type={'password'}
                        />

                        <TextInput
                            name={'repeatPassword'}
                            id={'user-passwordRepeat-create-form'}
                            label={'Repeat Password'}
                            form={form}
                            type={'password'}
                        />

                        {createUser.error && !form.formState.errors.email && !form.formState.errors.username && (
                            <Alert variant='destructive'>
                                <AlertTitle>Error, failed to create user!</AlertTitle>
                                <AlertDescription>{createUser.error.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        {createUser.isPending ? (
                            <Button className="w-[100%]" disabled>Creating user...</Button>
                        ) : (
                            <Button className="w-[100%]" type='submit'>Create User</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateUserDialog;