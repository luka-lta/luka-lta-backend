import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: ReactNode
    /** Primäre Aktion, z. B. "Link anlegen". */
    action?: ReactNode
    /** `bordered` für alleinstehende Flächen, `plain` innerhalb von Cards/Tabellen. */
    variant?: 'bordered' | 'plain'
    className?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, variant = 'bordered', className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
                variant === 'bordered' && 'rounded-xl border border-dashed bg-card',
                className,
            )}
        >
            <div className='flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                <Icon className='size-5' aria-hidden />
            </div>
            <div className='max-w-sm space-y-1'>
                <p className='text-sm font-medium'>{title}</p>
                {description && <p className='text-sm text-muted-foreground'>{description}</p>}
            </div>
            {action && <div className='mt-1'>{action}</div>}
        </div>
    )
}
