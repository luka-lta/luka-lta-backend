import {FieldPath, FieldValues, UseFormReturn} from "react-hook-form";
import {useState} from "react";
import {Label} from "@/components/ui/label.tsx";
import {cn} from "@/lib/utils.ts";
import {Input} from "@/components/ui/input.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

type AvatarInputProps<TFieldValues extends FieldValues> = {
    name: FieldPath<TFieldValues>
    id: string,
    label: string,
    form: UseFormReturn<TFieldValues>,
    avatarUrl?: string | null,
}

export const AvatarInput = <TFieldValues extends FieldValues>({
                                                                form,
                                                                name,
                                                                label,
                                                                id,
                                                                avatarUrl
                                                            }: AvatarInputProps<TFieldValues>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {register, getFieldState, formState: {errors: _ } } = form;
    const {error} = getFieldState(name);
    const [avatar, setAvatar] = useState<string | null>(avatarUrl ?? null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Erste Datei aus der Datei-Liste
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAvatar(reader.result as string); // Setze die Data-URL als Avatar
            };
            reader.readAsDataURL(file); // Lies die Datei als Data-URL

            // @ts-ignore
            form.setValue('avatarUrl', e.target.files!, { shouldDirty: true})
        }
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <Label
                htmlFor={id}
                className={cn('text-right', {'text-red-500': error})}
            >
                {label}
            </Label>

            <Avatar>
                {avatar ? (
                    <AvatarImage src={avatar} alt="Avatar"/>
                ) : (
                    <AvatarFallback>?</AvatarFallback>
                )}
            </Avatar>

            <Input
                {...register(name)}
                id={id}
                type={'file'}
                accept="image/*"
                onChange={handleAvatarChange}
                className={cn('col-span-3', {'border-red-500': error})}
            />
            {error && <span className="text-red-500 col-span-3">{error.message}</span>}
        </div>
    );
}