import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {UserFormSchema} from "@/shemas/UserSchema.ts";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";
import {toast} from "sonner";
import {useNavigate} from "react-router-dom";

const defaultValues = {
    email: "",
    password: "",
};

interface LoginFormProps {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
}

function LoginForm({isLoading, setIsLoading}: LoginFormProps) {
    const { login } = useAuthenticatedUserStore();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof UserFormSchema>>({
        resolver: zodResolver(UserFormSchema),
        defaultValues,
    });

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = form;

    const onSubmit = (values: z.infer<typeof UserFormSchema>) => {
        setIsLoading(true);
        try {
            login(values.email, values.password);

            toast.success("Redirecting to dashboard");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-300">
                    Email Address
                </Label>

                <div className="mt-2">
                    <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        {...register("email")}
                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text sm:leading-6 p-2 text-l ${
                            errors.email ? "ring-red-500" : ""
                        }`}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
                    Password
                </Label>
                <div className="mt-2">
                    <Input
                        id="password"
                        placeholder="Password"
                        type="password"
                        {...register("password")}
                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6 p-2 text-l ${
                            errors.password ? "ring-red-500" : ""
                        }`}
                    />
                    {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                </div>
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
