import {Button} from "@/components/ui/button";
import {TextInput} from "@/components/form/TextInput.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";
import {toast} from "sonner";
import {useRef} from "react";
import {AvatarInput} from "@/components/form/AvatarInput.tsx";
import {useUpdateSelfUser} from "@/api/self/hooks.ts";
import {Spinner} from "@/components/ui/kibo-ui/spinner/index.tsx";

const userUpdateSchema = z.object({
    username: z.string().min(3, {message: "Username must be at least 3 characters long"}),
    email: z.string().email({message: "Please enter a valid email address"}),
    avatarUrl: z.instanceof(FileList).optional(),
});

type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

interface ProfileOverviewProps {
    user: UserTypeSchema | undefined;
}

function ProfileForm({user}: ProfileOverviewProps) {
    const formRef = useRef<HTMLFormElement>(null);

    const form = useForm<UserUpdateFormData>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            username: user?.username,
            email: user?.email,
        }
    });

    const updateSelf = useUpdateSelfUser();

    const onSubmit: SubmitHandler<UserUpdateFormData> = () => {
        const formData = new FormData(formRef.current!);

        updateSelf.mutate(formData, {
            onSuccess: () => {
                toast.success('Profile updated successfully!', {
                    description: 'Your changes have been saved',
                });
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

                toast.error(error.message);
            },
        });
    };

    return (
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TextInput
                name="username"
                id="username-self-overview-update"
                label="Username"
                form={form}
                type="text"
            />

            <TextInput
                name="email"
                id="email-self-overview-update"
                label="Email Address"
                form={form}
                type="email"
            />

            <AvatarInput name={'avatarUrl'} id={'avatar-self-overview-update'} label={'Avatar'} form={form} avatarUrl={user?.avatarUrl} />

            <div className="flex justify-end gap-4 pt-4">
                <Button
                    type="submit"
                    disabled={!form.formState.isDirty || updateSelf.isPending}
                >
                    {form.formState.isSubmitting && <Spinner size={16} className="mr-2" />}
                    {form.formState.isSubmitting ? "Updating profile..." : "Update profile"}
                </Button>
            </div>
        </form>
    );
}

export default ProfileForm;