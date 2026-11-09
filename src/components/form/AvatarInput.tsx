import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { UserAvatar } from "@/components/data/user-avatar.tsx";

type AvatarInputProps<TFieldValues extends FieldValues> = {
    name: FieldPath<TFieldValues>
    id: string
    label: string
    form: UseFormReturn<TFieldValues>
    avatarUrl?: string | null
    fallbackName?: string
}

/**
 * Datei-Feld für Profilbilder mit Vorschau. Die Datei wird über das native
 * <input name> per FormData übertragen.
 */
export const AvatarInput = <TFieldValues extends FieldValues>({ form, name, label, id, avatarUrl, fallbackName }: AvatarInputProps<TFieldValues>) => {
    const { error } = form.getFieldState(name, form.formState);
    const [preview, setPreview] = useState<string | null>(null);
    const field = form.register(name);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        void field.onChange(e);
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null);
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className={error ? 'text-destructive' : undefined}>
                {label} <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex items-center gap-3">
                {preview ? (
                    <img src={preview} alt="" className="size-12 rounded-lg object-cover" />
                ) : (
                    <UserAvatar name={fallbackName} avatarUrl={avatarUrl} size="md" className="size-12" />
                )}
                <Input
                    {...field}
                    id={id}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    aria-invalid={error ? true : undefined}
                    className="cursor-pointer file:mr-3 file:cursor-pointer"
                />
            </div>
            {error && <p className="text-xs font-medium text-destructive">{error.message}</p>}
        </div>
    );
}
