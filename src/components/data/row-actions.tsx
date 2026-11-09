import { Fragment } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface RowAction {
    label: string
    icon?: LucideIcon
    onSelect: () => void
    /** Destruktive Aktionen werden rot und durch eine Linie abgesetzt. */
    destructive?: boolean
    disabled?: boolean
    hidden?: boolean
}

interface RowActionsProps {
    actions: RowAction[]
    /** Für Screenreader: "Aktionen für <label>". */
    label: string
    className?: string
}

/** Kontextmenü (⋯) für Tabellenzeilen und Karten. Klicks propagieren nicht zur Zeile. */
export function RowActions({ actions, label, className }: RowActionsProps) {
    const visible = actions.filter((a) => !a.hidden)
    const regular = visible.filter((a) => !a.destructive)
    const destructive = visible.filter((a) => a.destructive)
    if (visible.length === 0) return null

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    size='icon-sm'
                    className={cn('text-muted-foreground data-[state=open]:bg-accent', className)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal />
                    <span className='sr-only'>Aktionen für {label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='min-w-44' onClick={(e) => e.stopPropagation()}>
                {regular.map((action) => (
                    <DropdownMenuItem key={action.label} disabled={action.disabled} onSelect={action.onSelect}>
                        {action.icon && <action.icon />}
                        {action.label}
                    </DropdownMenuItem>
                ))}
                {destructive.map((action, i) => (
                    <Fragment key={action.label}>
                        {i === 0 && regular.length > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            disabled={action.disabled}
                            onSelect={action.onSelect}
                            className='text-destructive focus:bg-destructive/10 focus:text-destructive'
                        >
                            {action.icon && <action.icon />}
                            {action.label}
                        </DropdownMenuItem>
                    </Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
