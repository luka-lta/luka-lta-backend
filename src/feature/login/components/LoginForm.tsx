import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Button} from "@/components/ui/button.tsx";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";
import {toast} from "sonner";
import {useNavigate} from "react-router-dom";
import {TextInput} from "@/components/form/TextInput.tsx";
import {loginSchema, LoginSchema} from "@/feature/login/schema/loginSchema.ts";
import {HTMLAttributes, useState} from "react";
import {cn} from "@/lib/utils.ts";

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const defaultValues = {
    email: "",
    password: "",
};

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const {login} = useAuthenticatedUserStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues,
    });

    const handleLogin = async (data: LoginSchema) => {
        setIsLoading(true);
        try {
            await login(data);

            toast.success("Redirecting to dashboard");

            setTimeout(() => {
                setIsLoading(false);
                navigate("/dashboard");
            }, 1000);
        } catch (error: unknown) {
            setIsLoading(false);
            if (error instanceof Error) {
                toast.error(error.message);
            }
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

            {/* Submit-Button */}
            <div>
                <Button
                    type="submit"
                    className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6  shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                >
                    {isLoading ? "Sigining in..." : "Sign In"}
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