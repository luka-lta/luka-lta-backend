import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DetailItem {
    label: string
    value: ReactNode
    /** Monospace für IDs, Keys, IPs. */
    mono?: boolean
    hidden?: boolean
}

interface DetailListProps {
    items: DetailItem[]
    /** `stacked` = Label über Wert (schmale Sheets), `inline` = zweispaltig. */
    layout?: 'inline' | 'stacked'
    className?: string
}

/** Schlüssel-Wert-Liste für Detailansichten (Sheets, Seitenleisten). Leere Werte zeigen „—“. */
export function DetailList({ items, layout = 'inline', className }: DetailListProps) {
    return (
        <dl className={cn('divide-y text-sm', className)}>
            {items.filter((i) => !i.hidden).map((item) => (
                <div
                    key={item.label}
                    className={cn('py-2.5 first:pt-0 last:pb-0', layout === 'inline' ? 'grid grid-cols-[minmax(7rem,40%)_1fr] gap-3' : 'space-y-1')}
                >
                    <dt className='text-muted-foreground'>{item.label}</dt>
                    <dd className={cn('min-w-0 break-words', item.mono && 'font-mono text-xs leading-5')}>
                        {item.value === null || item.value === undefined || item.value === '' ? <span className='text-muted-foreground'>—</span> : item.value}
                    </dd>
                </div>
            ))}
        </dl>
    )
}
