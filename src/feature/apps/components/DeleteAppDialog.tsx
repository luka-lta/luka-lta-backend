import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { useDeleteApp } from '@/api/apps/hooks'
import type { AppEntity } from '@/api/apps/schema'
import { getApiErrorMessage } from '@/lib/apiError'

interface DeleteAppDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    app: AppEntity
    onDeleted?: () => void
}

export function DeleteAppDialog({ open, onOpenChange, app, onDeleted }: DeleteAppDialogProps) {
    const deleteApp = useDeleteApp()

    function handleConfirm() {
        deleteApp.mutate(app.id, {
            onSuccess: () => {
                onOpenChange(false)
                toast.success('App gelöscht')
                onDeleted?.()
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            onConfirm={handleConfirm}
            isLoading={deleteApp.isPending}
            destructive
            title='App löschen?'
            description={
                <>
                    <span className='font-medium text-foreground'>{app.name}</span> und ihre Analytics-Quellen werden
                    entfernt. Das kann nicht rückgängig gemacht werden.
                </>
            }
            confirmLabel='Löschen'
        />
    )
}
