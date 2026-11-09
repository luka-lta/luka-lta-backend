import { AlertTriangle, RefreshCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/apiError'

interface ErrorStateProps {
    title?: string
    /** Fehlerobjekt (Axios/Error) oder fertige Meldung. */
    error?: unknown
    message?: string
    onRetry?: () => void
    /** Zusätzliche Aktion, z. B. "Zur Übersicht". */
    action?: ReactNode
    variant?: 'bordered' | 'plain'
    className?: string
}

export function ErrorState({
    title = 'Daten konnten nicht geladen werden',
    error,
    message,
    onRetry,
    action,
    variant = 'bordered',
    className,
}: ErrorStateProps) {
    const text = message ?? (error !== undefined ? getApiErrorMessage(error) : undefined)
    return (
        <div
            role='alert'
            className={cn(
                'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
                variant === 'bordered' && 'rounded-xl border border-destructive/20 bg-destructive/[0.03]',
                className,
            )}
        >
            <div className='flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive'>
                <AlertTriangle className='size-5' aria-hidden />
            </div>
            <div className='max-w-md space-y-1'>
                <p className='text-sm font-medium'>{title}</p>
                {text && <p className='break-words text-sm text-muted-foreground'>{text}</p>}
            </div>
            {(onRetry || action) && (
                <div className='mt-1 flex flex-wrap items-center justify-center gap-2'>
                    {onRetry && (
                        <Button variant='outline' size='sm' onClick={() => onRetry()}>
                            <RefreshCcw />
                            Erneut versuchen
                        </Button>
                    )}
                    {action}
                </div>
            )}
        </div>
    )
}
