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
import {Loader2} from "lucide-react";

const userUpdateSchema = z.object({
    username: z.string().min(3, {message: "Mindestens 3 Zeichen"}),
    email: z.string().email({message: "Bitte eine gültige E-Mail-Adresse eingeben"}),
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
                toast.success('Profil gespeichert');
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
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <TextInput
                name="username"
                id="username-self-overview-update"
                label="Benutzername"
                autoComplete="username"
                form={form}
                type="text"
            />

            <TextInput
                name="email"
                id="email-self-overview-update"
                label="E-Mail"
                autoComplete="email"
                form={form}
                type="email"
            />

            <AvatarInput name={'avatarUrl'} id={'avatar-self-overview-update'} label={'Avatar'} form={form} avatarUrl={user?.avatarUrl} fallbackName={user?.username} />

            <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => form.reset()} disabled={!form.formState.isDirty || updateSelf.isPending}>
                    Verwerfen
                </Button>
                <Button type="submit" disabled={!form.formState.isDirty || updateSelf.isPending}>
                    {updateSelf.isPending && <Loader2 className="animate-spin" />}
                    Speichern
                </Button>
            </div>
        </form>
    );
}

export default ProfileForm;