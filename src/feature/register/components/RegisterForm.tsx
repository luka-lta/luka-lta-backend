import {useMutation} from "@tanstack/react-query";
import {SubmitHandler, useForm} from "react-hook-form";
import {registerSchema} from '../schema/RegisterSchema';
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {TextInput} from "@/components/form/TextInput.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {REGEXP_ONLY_DIGITS_AND_CHARS} from "input-otp"
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {FetchWrapper} from "@/lib/fetchWrapper.ts";

export type registerData = {
    email: string,
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
        mutationFn: async ({email, password, previewToken}: registerData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.post('/register', {
                email,
                password,
                previewToken,
            })
        },
        onSuccess: () => {
            toast.success('User created successfully!');
        },
        onError: (error) => {
            toast.error('Failed to create User');
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
                {/* TODO: Error show */}
                <Label htmlFor='previewToken-register-form'>Preview Token</Label>
                <div className="flex justify-center">
                    <InputOTP
                        id={'previewToken-register-form'}
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        value={form.watch("previewToken")}
                        onChange={handleOTPChange}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0}/>
                            <InputOTPSlot index={1}/>
                            <InputOTPSlot index={2}/>
                            <InputOTPSlot index={3}/>
                            <InputOTPSlot index={4}/>
                            <InputOTPSlot index={5}/>
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            </div>

            {registerUser.error && (
                <Alert variant='destructive'>
                    <AlertTitle>Error, failed to create user!</AlertTitle>
                    <AlertDescription>{registerUser.error.message}</AlertDescription>
                </Alert>
            )}

            {/* Submit-Button */}
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