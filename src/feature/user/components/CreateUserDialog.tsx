import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TextInput } from "@/components/form/TextInput.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { useCreateUser } from "@/api/user/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const userCreateSchema = z.object({
    username: z.string().min(3, "Mindestens 3 Zeichen"),
    email: z.string().min(1, "E-Mail ist erforderlich").email({ message: "Keine gültige E-Mail-Adresse" }),
    password: z.string().min(8, "Mindestens 8 Zeichen"),
    repeatPassword: z.string().transform((pwd) => pwd.trim()),
}).refine((data) => data.password === data.repeatPassword, {
    path: ["repeatPassword"],
    message: "Passwörter stimmen nicht überein",
})

export type userData = {
    username: string,
    email: string,
    password: string,
    repeatPassword: string,
}

function CreateUserDialog({ open, onOpenChange }: Props) {
    const form = useForm<userData>({ resolver: zodResolver(userCreateSchema) });
    const createUser = useCreateUser();

    const onSubmit: SubmitHandler<userData> = (data) => {
        createUser.mutate(data, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
                toast.success('Benutzer angelegt');
            },
            onError: (error) => {
                const message = getApiErrorMessage(error);
                if (message.includes('email')) form.setError('email', { type: 'manual', message });
                else if (message.includes('username')) form.setError('username', { type: 'manual', message });
                else toast.error(message);
            },
        });
    };

    return (
        <FormDialog
            open={open}
            onOpenChange={(next) => { if (!next) form.reset(); onOpenChange(next); }}
            title="Benutzer anlegen"
            description="Neuer Zugang zum Admin-Bereich."
            size="sm"
            onSubmit={form.handleSubmit(onSubmit)}
            submitLabel="Benutzer anlegen"
            isSubmitting={createUser.isPending}
        >
            <TextInput name="email" id="user-email-create" label="E-Mail" form={form} type="email" autoComplete="off" placeholder="name@beispiel.de" />
            <TextInput name="username" id="user-username-create" label="Benutzername" form={form} autoComplete="off" />
            <div className="grid gap-5 sm:grid-cols-2">
                <TextInput name="password" id="user-password-create" label="Passwort" form={form} type="password" autoComplete="new-password" description="Mindestens 8 Zeichen." />
                <TextInput name="repeatPassword" id="user-password-repeat-create" label="Passwort wiederholen" form={form} type="password" autoComplete="new-password" />
            </div>
        </FormDialog>
    );
}

export default CreateUserDialog;
