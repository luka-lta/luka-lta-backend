import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const SEGMENT_LABELS: Record<string, string> = {
    dashboard: 'Übersicht',
    users: 'Benutzer',
    linktree: 'Links',
    clicks: 'Klicks',
    'api-keys': 'API-Keys',
    tools: 'Tools',
    settings: 'Einstellungen',
    homelab: 'Homelab',
    containers: 'Container',
    topology: 'Topologie',
    calendar: 'Kalender',
    weather: 'Wetter',
    appearance: 'Darstellung',
    account: 'Konto & Sicherheit',
    blog: 'Blog',
    create: 'Neuer Beitrag',
    projects: 'Projekte',
    notifications: 'Benachrichtigungen',
    apps: 'Apps',
    business: 'Business',
}

const DYNAMIC_LABELS: Record<string, string> = {
    blog: 'Beitrag bearbeiten',
    linktree: 'Link-Details',
    apps: 'App-Details',
}

function getLabel(segment: string, parentSegment?: string): string {
    return SEGMENT_LABELS[segment] ?? DYNAMIC_LABELS[parentSegment ?? ''] ?? 'Details'
}

/** Breadcrumb aus der URL. Auf Mobile nur die aktuelle Seite. */
export function DynamicBreadcrumb() {
    const { pathname } = useLocation()
    const segments = pathname.split('/').filter(Boolean)

    const items = segments.map((segment, index) => ({
        segment,
        path: '/' + segments.slice(0, index + 1).join('/'),
        label: getLabel(segment, index > 0 ? segments[index - 1] : undefined),
        isLast: index === segments.length - 1,
    }))

    return (
        <Breadcrumb className='min-w-0'>
            <BreadcrumbList className='flex-nowrap'>
                {items.map(({ segment, path, label, isLast }, index) => (
                    <React.Fragment key={`${segment}-${index}`}>
                        <BreadcrumbItem className={isLast ? 'min-w-0' : 'hidden md:inline-flex'}>
                            {isLast ? (
                                <BreadcrumbPage className='truncate font-medium'>{label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={path}>{label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator className='hidden md:block' />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
