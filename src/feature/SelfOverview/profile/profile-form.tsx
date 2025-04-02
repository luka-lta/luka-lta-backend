import {Button} from "@/components/ui/button";
import {TextInput} from "@/components/form/TextInput.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {toast} from "sonner";

const userUpdateSchema = z.object({
    username: z.string().min(3, {message: "Username must be at least 3 characters long"}),
    email: z.string().email({message: "Please enter a valid email address"}),
    avatarUrl: z.string().optional(),
});

interface userUpdateData {
    username: string;
    email: string;
    avatarUrl?: string;
}

interface ProfileOverviewProps {
    user: UserTypeSchema | undefined;
}

function ProfileForm({user}: ProfileOverviewProps) {
    const queryClient = useQueryClient();

    const form = useForm<userUpdateData>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            username: user?.username,
            email: user?.email,
            avatarUrl: user?.avatarUrl ?? '',
        }
    });

    const updateSelf = useMutation({
        mutationFn: async ({email, avatarUrl, username}: userUpdateData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.put(`/self/`, {
                userId: user?.userId,
                username,
                email,
                avatarUrl,
            });
        },
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
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['self', 'user'],
                });
            }, 500);
        }
    });

    const onSubmit: SubmitHandler<userUpdateData> = (data) => updateSelf.mutate(data);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="flex justify-end gap-4 pt-4">
                <Button
                    type="submit"
                    disabled={!form.formState.isDirty || updateSelf.isPending}
                >
                    {form.formState.isSubmitting ? "Updating profile..." : "Update profile"}
                </Button>
            </div>
        </form>
    );
}

export default ProfileForm;