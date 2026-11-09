import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: ReactNode
    description: ReactNode
    confirmLabel?: string
    cancelLabel?: string
    /** Rote Bestätigung für endgültige Aktionen (Löschen). */
    destructive?: boolean
    onConfirm: () => void
    isLoading?: boolean
    disabled?: boolean
    /** Zusätzliche Inhalte, z. B. ein Bestätigungsfeld. */
    children?: ReactNode
}

/** Nur für Entscheidungen, die wirklich eine Bestätigung brauchen. */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Bestätigen',
    cancelLabel = 'Abbrechen',
    destructive,
    onConfirm,
    isLoading,
    disabled,
    children,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div>{description}</div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {children}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
                    <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={disabled || isLoading}>
                        {isLoading && <Loader2 className='animate-spin' />}
                        {confirmLabel}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
