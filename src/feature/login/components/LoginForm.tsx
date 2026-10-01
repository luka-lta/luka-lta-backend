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
import {Spinner} from "@/components/ui/kibo-ui/spinner/index.tsx";

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const defaultValues = {
    email: "",
    password: "",
};

function getLoginError(error: unknown): string {
    if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) return "Invalid credentials";
        if (status === 404) return "User not found";
        if (status === 429) return "Too many attempts. Please try again later.";
        if (!error.response) return "Network error. Check your connection.";
    }
    return "Login failed. Please try again.";
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
            className={cn('grid gap-3', className)}
            {...props}
        >
            <div>
                <TextInput
                    name={'email'}
                    id={'email-login-form'}
                    label={'Email'}
                    form={form}
                    type={'email'}
                />
            </div>

            <div>
                <TextInput
                    name={'password'}
                    id={'password-login-form'}
                    placeholder={'*********'}
                    label={'Password'}
                    form={form}
                    type={'password'}
                />
            </div>

            {form.formState.errors.root && (
                <p className="text-sm text-red-500">{form.formState.errors.root.message}</p>
            )}

            {/* Submit-Button */}
            <div>
                <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="flex w-full justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold leading-6  shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                >
                    {loginMutation.isPending && <Spinner size={16} />}
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
            </div>

            {/* Register Link */}
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <span
                        className="text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium"
                        onClick={() => navigate("/register")}
                    >
                    Register here
                  </span>
                </p>
            </div>
        </form>
    );
}
