import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteApp } from '@/api/apps/hooks'
import type { AppEntity } from '@/api/apps/schema'

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
            onError: (error) => toast.error(error.message),
        })
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleConfirm}
            title={
                <span className="text-destructive">
                    <AlertTriangle className="stroke-destructive mr-1 inline-block" size={18} />
                    App löschen
                </span>
            }
            desc={
                <p>
                    App <span className="font-bold">{app.name}</span> wirklich löschen? Das kann nicht rückgängig
                    gemacht werden.
                </p>
            }
            confirmText={deleteApp.isPending ? 'Löschen...' : 'Löschen'}
            isLoading={deleteApp.isPending}
            destructive
        />
    )
}
