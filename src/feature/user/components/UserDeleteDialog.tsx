import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";
import {useState} from "react";
import {toast} from "sonner";
import {ConfirmDialog} from "@/components/confirm-dialog.tsx";
import {AlertTriangle} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {useDeleteUser} from "@/api/user/hooks.ts";

interface Props {
    open: boolean
    onOpenChange: () => void
    currentRow: UserTypeSchema
}

function UserDeleteDialog({open, onOpenChange, currentRow}: Props) {
    const [value, setValue] = useState('')
    const deleteUser = useDeleteUser();

    const handleDelete = () => {
        if (value.trim() !== currentRow.username) return

        deleteUser.mutate(currentRow.userId, {
            onSuccess: () => {
                onOpenChange()
                toast.success('The following user has been deleted: ' + currentRow.username)
            },
            onError: (error) => {
                toast.error(error.message)
            },
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            isLoading={deleteUser.isPending}
            title={
                <span className='text-destructive'>
                  <AlertTriangle
                      className='stroke-destructive mr-1 inline-block'
                      size={18}
                  />{' '}
                    Delete User
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to delete{' '}
                        <span className='font-bold'>{currentRow.username}</span>?
                        <br />
                        This action will permanently remove the user from the system. This cannot be undone.
                    </p>
                    <Label className='my-2'>
                        Username:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Enter username to confirm deletion.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                            Please be carefull, this operation can not be rolled back. The user must be
                            deactivated (via Edit) before it can be deleted.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText={deleteUser.isPending ? 'Deleting...' : 'Delete'}
            destructive
        />
    );
}

export default UserDeleteDialog;
