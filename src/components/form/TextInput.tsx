import {FieldPath, FieldValues, UseFormReturn} from "react-hook-form";
import {HTMLInputTypeAttribute} from "react";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {Input} from "@/components/ui/input.tsx";

type TextInputProps<TFieldValues extends FieldValues> = {
    name: FieldPath<TFieldValues>
    id: string,
    type?: HTMLInputTypeAttribute,
    label: string,
    placeholder?: string,
    form: UseFormReturn<TFieldValues>,
}

export const TextInput = <TFieldValues extends FieldValues>({
                                                                form,
                                                                name,
                                                                type,
                                                                label,
                                                                placeholder,
                                                                id,
                                                            }: TextInputProps<TFieldValues>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {register, getFieldState, formState: {errors: _ } } = form;
    const {error} = getFieldState(name);

    return (
        <div className="flex flex-col items-start gap-2">
            <Label
                htmlFor={id}
                className={cn('text-right', {'text-red-500': error})}
            >
                {label}
            </Label>

            <Input
                {...register(name)}
                placeholder={placeholder}
                id={id}
                type={type}
                className={cn('col-span-3', {'border-red-500': error})}
            />
            {error && <span className="text-red-500 col-span-3">{error.message}</span>}
        </div>
    );
}