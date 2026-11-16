import { useEffect, useId, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const APP_NAME = 'Luka Dev Admin'

type PageWidth = 'default' | 'narrow' | 'full'

const WIDTH_CLASS: Record<PageWidth, string> = {
    default: 'max-w-page',
    narrow: 'max-w-page-narrow',
    full: 'max-w-none',
}

interface PageContainerProps {
    /** Setzt den Browser-Tab-Titel ("<title> · Luka Dev Admin"). */
    title?: string
    width?: PageWidth
    /** Füllt die verfügbare Höhe (z. B. Kalender, Topologie-Karte). */
    fill?: boolean
    className?: string
    children: ReactNode
}

/**
 * Äußerer Rahmen jeder Seite: einheitliche Breite, Ränder und vertikaler
 * Abstand (space-y-6) zwischen Header, Toolbar und Inhalt.
 */
export function PageContainer({ title, width = 'default', fill, className, children }: PageContainerProps) {
    useEffect(() => {
        document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
    }, [title])

    return (
        <main
            id='main-content'
            tabIndex={-1}
            className={cn(
                'mx-auto w-full flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8',
                WIDTH_CLASS[width],
                fill ? 'flex min-h-0 flex-col gap-6' : 'space-y-6',
                'animate-fade-in',
                className,
            )}
        >
            {children}
        </main>
    )
}

interface PageHeaderProps {
    title: ReactNode
    description?: ReactNode
    /** Primäre/sekundäre Aktionen, rechts ausgerichtet. Primäraktion zuletzt. */
    actions?: ReactNode
    /** Status o. ä. direkt neben dem Titel. */
    meta?: ReactNode
    /** Optionales Icon/Avatar links vom Titel (Detailseiten). */
    media?: ReactNode
    /** Zurück-Link für Detailseiten. */
    back?: { to: string; label: string }
    className?: string
}

export function PageHeader({ title, description, actions, meta, media, back, className }: PageHeaderProps) {
    return (
        <header className={cn('flex flex-col gap-4', className)}>
            {back && (
                <Button asChild variant='link' size='sm' className='-mb-1 w-fit gap-1 text-muted-foreground hover:text-foreground hover:no-underline'>
                    <Link to={back.to}>
                        <ArrowLeft />
                        {back.label}
                    </Link>
                </Button>
            )}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div className='flex min-w-0 items-start gap-3'>
                    {media && <div className='shrink-0'>{media}</div>}
                    <div className='min-w-0 space-y-1'>
                        <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                            <h1 className='text-page-title truncate'>{title}</h1>
                            {meta}
                        </div>
                        {description && <p className='text-sm text-muted-foreground'>{description}</p>}
                    </div>
                </div>
                {actions && <div className='flex shrink-0 flex-wrap items-center gap-2'>{actions}</div>}
            </div>
        </header>
    )
}

interface SectionHeaderProps {
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
    id?: string
    className?: string
}

export function SectionHeader({ title, description, actions, id, className }: SectionHeaderProps) {
    return (
        <div className={cn('flex flex-wrap items-end justify-between gap-2', className)}>
            <div className='space-y-0.5'>
                <h2 id={id} className='text-section-title'>{title}</h2>
                {description && <p className='text-sm text-muted-foreground'>{description}</p>}
            </div>
            {actions && <div className='flex items-center gap-2'>{actions}</div>}
        </div>
    )
}

interface PageSectionProps extends Omit<SectionHeaderProps, 'id' | 'title'> {
    title?: ReactNode
    children: ReactNode
}

/** Inhaltlicher Abschnitt mit optionaler Überschrift. Kein eigener Container-Rahmen. */
export function PageSection({ title, description, actions, className, children }: PageSectionProps) {
    const headingId = useId()
    return (
        <section aria-labelledby={title ? headingId : undefined} className={cn('space-y-3', className)}>
            {title && <SectionHeader id={headingId} title={title} description={description} actions={actions} />}
            {children}
        </section>
    )
}

interface PageToolbarProps {
    /** Suche und Filter (links). */
    children: ReactNode
    /** Ansichts- oder Sammelaktionen (rechts). */
    actions?: ReactNode
    className?: string
}

/** Zeile für Suche, Filter und Tabellenaktionen direkt über einer Datenansicht. */
export function PageToolbar({ children, actions, className }: PageToolbarProps) {
    return (
        <div role='toolbar' className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', className)}>
            <div className='flex flex-1 flex-wrap items-center gap-2'>{children}</div>
            {actions && <div className='flex shrink-0 flex-wrap items-center gap-2'>{actions}</div>}
        </div>
    )
}
