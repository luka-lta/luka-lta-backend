import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { HTMLInputTypeAttribute, ReactNode } from "react";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";

type TextInputProps<TFieldValues extends FieldValues> = {
    name: FieldPath<TFieldValues>
    id: string
    type?: HTMLInputTypeAttribute
    label: string
    placeholder?: string
    form: UseFormReturn<TFieldValues>
    /** Hilfetext unter dem Feld. */
    description?: ReactNode
    /** Kennzeichnet das Feld als optional (Pflicht ist der Standard). */
    optional?: boolean
    autoComplete?: string
}

/** Standard-Textfeld für react-hook-form: Label, Feld, Hilfe- und Fehlertext. */
export const TextInput = <TFieldValues extends FieldValues>({
    form,
    name,
    type,
    label,
    placeholder,
    id,
    description,
    optional,
    autoComplete,
}: TextInputProps<TFieldValues>) => {
    const { error } = form.getFieldState(name, form.formState);
    const describedBy = [description ? `${id}-description` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className={error ? 'text-destructive' : undefined}>
                {label}
                {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
            </Label>
            <Input
                {...form.register(name)}
                id={id}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
            />
            {description && !error && <p id={`${id}-description`} className="text-xs text-muted-foreground">{description}</p>}
            {error && <p id={`${id}-error`} className="text-xs font-medium text-destructive">{error.message}</p>}
        </div>
    );
}
