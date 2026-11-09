import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const DOT: Record<StatusTone, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
    info: 'bg-info',
    neutral: 'bg-muted-foreground/60',
}

interface StatusBadgeProps {
    tone: StatusTone
    children: ReactNode
    /** Pulsierender Punkt — nur für Live-Zustände (z. B. "läuft gerade"). */
    pulse?: boolean
    className?: string
}

/**
 * Einheitliche Statusanzeige: Farbe + Punkt + Text. Status wird nie nur über
 * Farbe vermittelt.
 */
export function StatusBadge({ tone, children, pulse, className }: StatusBadgeProps) {
    return (
        <Badge variant={tone} className={cn('gap-1.5', className)}>
            <span className='relative flex size-1.5' aria-hidden>
                {pulse && <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-60', DOT[tone])} />}
                <span className={cn('relative inline-flex size-1.5 rounded-full', DOT[tone])} />
            </span>
            {children}
        </Badge>
    )
}
