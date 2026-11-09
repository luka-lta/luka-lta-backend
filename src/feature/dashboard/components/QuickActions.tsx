import { Link } from 'react-router-dom'
import { PageSection } from '@/components/layout/page'
import { QUICK_ACTIONS } from '@/config/quickActions'

/** Schnellaktionen auf der Übersicht: führen direkt in den jeweiligen Anlegen-Dialog. */
export function QuickActions() {
    return (
        <PageSection title='Schnellaktionen'>
            <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5'>
                {QUICK_ACTIONS.map(({ label, description, icon: Icon, to }) => (
                    <li key={label}>
                        <Link
                            to={to}
                            className='flex h-full items-center gap-3 rounded-lg border bg-card p-3 shadow-xs transition-colors duration-fast hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        >
                            <span className='flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
                                <Icon className='size-4' aria-hidden='true' />
                            </span>
                            <span className='min-w-0'>
                                <span className='block truncate text-sm font-medium'>{label}</span>
                                <span className='block truncate text-xs text-muted-foreground'>{description}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </PageSection>
    )
}
