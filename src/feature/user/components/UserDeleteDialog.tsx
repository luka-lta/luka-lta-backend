import { useState } from "react";
import { toast } from "sonner";
import { UserTypeSchema } from "@/feature/user/schema/UserSchema.ts";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input";
import { useDeleteUser } from "@/api/user/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface Props {
    open: boolean
    onOpenChange: () => void
    currentRow: UserTypeSchema
}

function UserDeleteDialog({ open, onOpenChange, currentRow }: Props) {
    const [value, setValue] = useState('')
    const deleteUser = useDeleteUser();
    const matches = value.trim() === currentRow.username

    const handleDelete = () => {
        if (!matches) return
        deleteUser.mutate(currentRow.userId, {
            onSuccess: () => {
                onOpenChange()
                toast.success(`${currentRow.username} wurde gelöscht`)
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handleDelete}
            isLoading={deleteUser.isPending}
            disabled={!matches}
            destructive
            title="Benutzer löschen?"
            description={
                <>
                    <span className="font-medium text-foreground">{currentRow.username}</span> wird dauerhaft entfernt.
                    Das kann nicht rückgängig gemacht werden. Der Benutzer muss vorher deaktiviert sein.
                </>
            }
            confirmLabel="Endgültig löschen"
        >
            <div className="space-y-2">
                <Label htmlFor="delete-user-confirm">
                    Zum Bestätigen <span className="font-mono">{currentRow.username}</span> eingeben
                </Label>
                <Input id="delete-user-confirm" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" />
            </div>
        </ConfirmDialog>
    );
}

export default UserDeleteDialog;
