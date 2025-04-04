import {useMutation} from "@tanstack/react-query";
import {SubmitHandler, useForm} from "react-hook-form";
import {registerSchema} from '../schema/RegisterSchema';
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {TextInput} from "@/components/form/TextInput.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {REGEXP_ONLY_DIGITS_AND_CHARS} from "input-otp"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";
import {OtpInput} from "@/components/form/OtpInput.tsx";

export type registerData = {
    email: string,
    username: string,
    password: string,
    repeatPassword: string,
    previewToken: string,
}

function RegisterForm() {
    const navigate = useNavigate();

    const form = useForm<registerData>({
        resolver: zodResolver(registerSchema),
    })

    const registerUser = useMutation({
        mutationFn: async ({email, username, password, previewToken}: registerData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post('/register', {
                email,
                username,
                password,
                previewToken,
            })
        },
        onSuccess: () => {
            toast.success('Registration successful');

            setTimeout(() => {
                navigate('/');
            }, 2000);
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

            if (errorMessage.includes('token')) {
                form.setError('previewToken', {
                    type: 'manual',
                    message: errorMessage,
                });
            }

            toast.error('Registration failed');
            console.error(error);
        }
    })

    const handleOTPChange = (value: string) => {
        form.setValue("previewToken", value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
    };

    const onSubmit: SubmitHandler<registerData> = (data) => registerUser.mutate(data);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TextInput
                name={'username'}
                id={'username-register-form'}
                label={'Username'}
                form={form}
                type={'text'}
            />

            <TextInput
                name={'email'}
                id={'email-register-form'}
                label={'Email'}
                form={form}
                type={'email'}
            />

            <TextInput
                name={'password'}
                id={'password-register-form'}
                label={'Password'}
                form={form}
                type={'password'}
            />

            <TextInput
                name={'repeatPassword'}
                id={'passwordRepeat-register-form'}
                label={'Repeat Password'}
                form={form}
                type={'password'}
            />

            <div className="space-y-2">
                <OtpInput
                    name={'previewToken'}
                    id={'previewToken-register-form'}
                    maxLength={6}
                    label={'Preview Token'}
                    form={form}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    value={form.watch("previewToken")}
                    onChange={handleOTPChange}
                />
            </div>

            {registerUser.error && !form.formState.errors.previewToken && (
                <Alert variant='destructive'>
                    <AlertTitle>Error, failed to create user!</AlertTitle>
                    <AlertDescription>{registerUser.error.message}</AlertDescription>
                </Alert>
            )}

            <div>
                <Button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    {registerUser.isPending ? "Sigining in..." : "Register"}
                </Button>
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <span
                        className="text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium"
                        onClick={() => navigate("/")}
                    >
                    Login here
                  </span>
                </p>
            </div>
        </form>
    );
}

export default RegisterForm;