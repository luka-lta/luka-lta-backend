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
    dashboard: 'Dashboard',
    users: 'Users',
    'preview-access': 'Preview Access',
    linktree: 'Linktree',
    clicks: 'Clicks',
    'api-keys': 'API Keys',
    tools: 'Tools',
    permissions: 'Permissions',
    settings: 'Settings',
    appearance: 'Appearance',
    account: 'Account',
    'site-configuration': 'Site Configuration',
    blog: 'Blog Posts',
    'blog-tags': 'Blog Tags',
    'tracked-users': 'Tracked Users',
    create: 'New Post',
}

const DYNAMIC_LABELS: Record<string, string> = {
    blog: 'Edit Post',
    'tracked-users': 'User Profile',
    linktree: 'Link Detail',
}

function getLabel(segment: string, parentSegment?: string): string {
    if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment]
    return DYNAMIC_LABELS[parentSegment ?? ''] ?? 'Detail'
}

function isKnownSegment(segment: string): boolean {
    return segment in SEGMENT_LABELS
}

export function DynamicBreadcrumb() {
    const { pathname } = useLocation()
    const segments = pathname.split('/').filter(Boolean)

    // Skip if only at root dashboard level — no breadcrumb needed
    if (segments.length <= 1) return null

    const items = segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/')
        const parentSegment = index > 0 ? segments[index - 1] : undefined
        const label = getLabel(segment, parentSegment)
        const isLast = index === segments.length - 1
        const isDynamic = !isKnownSegment(segment)
        return { segment, path, label, isLast, isDynamic }
    })

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map(({ segment, path, label, isLast }, index) => (
                    <React.Fragment key={`${segment}-${index}`}>
                        <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={path}>{label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
