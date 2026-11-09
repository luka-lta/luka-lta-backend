import { z } from "zod"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRef } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import { TextInput } from "@/components/form/TextInput.tsx"
import { AvatarInput } from "@/components/form/AvatarInput.tsx"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx"
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { UserTypeSchema } from "@/feature/user/schema/UserSchema.ts";
import { useUpdateUser } from "@/api/user/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
    currentRow: UserTypeSchema
    open: boolean
    onOpenChange: (open: boolean) => void
}

const userEditSchema = z.object({
    username: z.string().min(3, "Mindestens 3 Zeichen"),
    email: z.string().email("Keine gültige E-Mail-Adresse"),
    avatar: z.any().nullable(),
    isActive: z.boolean(),
})

export type userData = {
    username: string
    email: string
    avatar: File | null
    isActive: boolean
}
function EditUserSheet({ currentRow, open, onOpenChange }: Props) {
    const formRef = useRef<HTMLFormElement>(null);

    const form = useForm<userData>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            email: currentRow.email,
            username: currentRow.username,
            avatar: null,
            isActive: currentRow.isActive,
        },
    })

    const editUser = useUpdateUser(currentRow.userId);

    const onSubmit: SubmitHandler<userData> = () => {
        const formData = new FormData(formRef.current!);

        editUser.mutate(formData, {
            onSuccess: () => {
                onOpenChange(false)
                toast.success("Änderungen gespeichert")
            },
            onError: (error) => {
                const message = getApiErrorMessage(error);
                if (message.includes('email')) form.setError('email', { type: 'manual', message });
                else if (message.includes('username')) form.setError('username', { type: 'manual', message });
                else toast.error(message);
            },
        });
    }

    return (
        <Sheet
            open={open}
            onOpenChange={(state) => {
                form.reset()
                onOpenChange(state)
            }}
        >
            <SheetContent>
                <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6" noValidate>
                    <SheetHeader>
                        <SheetTitle>Benutzer bearbeiten</SheetTitle>
                        <SheetDescription>
                            ID <span className="font-mono">{currentRow.userId}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-5">
                        <TextInput name="email" id="user-email-edit" label="E-Mail" form={form} type="email" />
                        <TextInput name="username" id="user-username-edit" label="Benutzername" form={form} />
                        <AvatarInput name="avatar" id="user-avatar-edit" label="Profilbild" form={form} avatarUrl={currentRow.avatarUrl} fallbackName={currentRow.username} />

                        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label htmlFor="user-active-edit">Aktiv</Label>
                                <p className="text-xs text-muted-foreground">Inaktive Benutzer können sich nicht anmelden.</p>
                            </div>
                            <Controller
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <Switch id="user-active-edit" checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>
                    </div>

                    <SheetFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => { form.reset(); onOpenChange(false) }}
                            disabled={editUser.isPending}
                        >
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={editUser.isPending}>
                            {editUser.isPending && <Loader2 className="animate-spin" />}
                            Speichern
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

export default EditUserSheet
