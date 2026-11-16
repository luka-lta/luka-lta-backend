import type { FormEvent, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

const SIZE = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
} as const

interface FormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: ReactNode
    description?: ReactNode
    /** sm = 1–2 Felder, md = Standardformular, lg = komplexe Formulare mit Abschnitten. */
    size?: keyof typeof SIZE
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    submitLabel: string
    cancelLabel?: string
    isSubmitting?: boolean
    submitDisabled?: boolean
    children: ReactNode
    className?: string
}

/**
 * Standard-Dialog für Anlegen/Bearbeiten: Kopf, scrollbarer Inhalt, fester Footer
 * mit "Abbrechen" links neben der Primäraktion.
 */
export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    size = 'md',
    onSubmit,
    submitLabel,
    cancelLabel = 'Abbrechen',
    isSubmitting,
    submitDisabled,
    children,
    className,
}: FormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn('flex max-h-[calc(100svh-2rem)] flex-col gap-0 overflow-hidden p-0', SIZE[size], className)}>
                <DialogHeader className='border-b px-6 py-4'>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <form onSubmit={onSubmit} className='flex min-h-0 flex-1 flex-col' noValidate>
                    <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>{children}</div>
                    <DialogFooter className='border-t bg-muted/30 px-6 py-3'>
                        <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {cancelLabel}
                        </Button>
                        <Button type='submit' disabled={isSubmitting || submitDisabled}>
                            {isSubmitting && <Loader2 className='animate-spin' />}
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
