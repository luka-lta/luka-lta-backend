import {FieldPath, FieldValues, UseFormReturn} from "react-hook-form";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {InputOTP, InputOTPSlot} from "@/components/ui/input-otp.tsx";

type TextInputProps<TFieldValues extends FieldValues> = {
    name: FieldPath<TFieldValues>
    id: string,
    maxLength: number,
    label: string,
    pattern?: string,
    value?: string,
    onChange?: (value: string) => void;
    form: UseFormReturn<TFieldValues>,
}

export const OtpInput = <TFieldValues extends FieldValues>({
                                                               name,
                                                               form,
                                                               label,
                                                               maxLength,
                                                               pattern,
                                                               value,
                                                               onChange,
                                                               id,
                                                           }: TextInputProps<TFieldValues>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {register, getFieldState, formState: {errors: _}} = form;
    const {error} = getFieldState(name);

    return (
        <div className="space-y-2">
            <Label
                htmlFor={id}
                className={cn('text-right', {'text-red-500': error})}
            >
                {label}
            </Label>
            <div className='flex justify-center'>
                <InputOTP
                    {...register(name)}
                    id={id}
                    maxLength={maxLength}
                    pattern={pattern}
                    value={value}
                    onChange={onChange}
                    className={cn('col-span-3', {'border-red-500': error})}
                >
                    {Array.from({length: maxLength}, (_, index) => (
                        <InputOTPSlot key={index} index={index}/>
                    ))}
                </InputOTP>
            </div>

            {error && <span className="text-red-500 col-span-3">{error.message}</span>}
        </div>
    );
}