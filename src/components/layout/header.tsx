import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement>

/** Sticky App-Header: Sidebar-Toggle, Breadcrumb, globale Aktionen. */
export const Header = ({ className, children, ...props }: HeaderProps) => (
    <header
        className={cn(
            'sticky top-0 z-header flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6',
            className,
        )}
        {...props}
    >
        <SidebarTrigger className='-ml-1.5 shrink-0' />
        <Separator orientation='vertical' className='mr-1 h-5 shrink-0' />
        {children}
    </header>
)

Header.displayName = 'Header'
