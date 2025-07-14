import {FieldPath, FieldValues, UseFormReturn} from "react-hook-form";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {Textarea} from "@/components/ui/textarea.tsx";

type TextInputProps<TFieldValues extends FieldValues> = {
    name: FieldPath<TFieldValues>
    id: string,
    label: string,
    placeholder?: string,
    className?: string,
    rows?: number,
    form: UseFormReturn<TFieldValues>,
}

export const TextAreaInput = <TFieldValues extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    className,
    rows = 3,
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

            <Textarea
                {...register(name)}
                placeholder={placeholder}
                id={id}
                rows={rows}
                className={cn('col-span-3' + className, {'border-red-500': error})}
            />
            {error && <span className="text-red-500 col-span-3">{error.message}</span>}
        </div>
    );
}