import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {AxiosError} from "axios";
import {Button} from "@/components/ui/button.tsx";
import {useAuthenticatedUserStore} from "@/store/authStore.ts";
import {useLogin} from "@/api/auth/hooks.ts";
import {useNavigate} from "react-router-dom";
import {TextInput} from "@/components/form/TextInput.tsx";
import {loginSchema, LoginSchema} from "@/feature/login/schema/loginSchema.ts";
import {HTMLAttributes} from "react";
import {cn} from "@/lib/utils.ts";
import {Loader2} from "lucide-react";

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const defaultValues = {
    email: "",
    password: "",
};

function getLoginError(error: unknown): string {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) return "E-Mail oder Passwort ist falsch.";
        if (status === 404) return "Kein Konto mit dieser E-Mail gefunden.";
        if (status === 429) return "Zu viele Versuche. Bitte warte kurz und versuche es erneut.";
        if (!error.response) return "Keine Verbindung zur API. Prüfe deine Internetverbindung.";
    }
    return "Anmeldung fehlgeschlagen. Bitte versuche es erneut.";
}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const setAuth = useAuthenticatedUserStore((s) => s.setAuth);
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues,
    });

    const handleLogin = async (data: LoginSchema) => {
        try {
            const result = await loginMutation.mutateAsync(data);
            setAuth(result.token, result.user);
            navigate("/dashboard");
        } catch (error: unknown) {
            form.setError("root", { type: "manual", message: getLoginError(error) });
        }
    };

    const onSubmit: SubmitHandler<LoginSchema> = (data) => handleLogin(data);

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn('space-y-5', className)}
            noValidate
            {...props}
        >
            <TextInput
                name={'email'}
                id={'email-login-form'}
                label={'E-Mail'}
                form={form}
                type={'email'}
                autoComplete={'username'}
            />
            <TextInput
                name={'password'}
                id={'password-login-form'}
                label={'Passwort'}
                form={form}
                type={'password'}
                autoComplete={'current-password'}
            />

            {form.formState.errors.root && (
                <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {form.formState.errors.root.message}
                </p>
            )}

            <Button type="submit" disabled={loginMutation.isPending} className="w-full">
                {loginMutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
                {loginMutation.isPending ? "Wird angemeldet…" : "Anmelden"}
            </Button>
        </form>
    );
}
