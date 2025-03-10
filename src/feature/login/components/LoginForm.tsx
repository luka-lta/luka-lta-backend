import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Button} from "@/components/ui/button.tsx";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";
import {toast} from "sonner";
import {useNavigate} from "react-router-dom";
import {TextInput} from "@/components/form/TextInput.tsx";
import {loginSchema, LoginSchema} from "@/feature/login/schema/loginSchema.ts";
import {useState} from "react";

const defaultValues = {
    email: "",
    password: "",
};

function LoginForm() {
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    label={'Password'}
                    form={form}
                    type={'password'}
                />
            </div>

            {/* Submit-Button */}
            <div>
                <Button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    {isLoading ? "Sigining in..." : "Sign In"}
                </Button>
            </div>
        </form>
    );
}

export default LoginForm;
