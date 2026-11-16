import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { NavCollapsible, NavItem, NavLink, type NavGroup } from './types'
import { Link, useLocation } from 'react-router-dom'

export function NavGroup({ title, items }: NavGroup) {
    const { state } = useSidebar()
    return (
        <SidebarGroup className='py-1'>
            {title && <SidebarGroupLabel className='h-7 text-[11px] font-medium text-sidebar-foreground/60'>{title}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => {
                    const key = `${item.title}-${item.url}`

                    if (!item.items)
                        return <SidebarMenuLink key={key} item={item} />

                    if (state === 'collapsed')
                        return <SidebarMenuCollapsedDropdown key={key} item={item} />

                    return <SidebarMenuCollapsible key={key} item={item} />
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
    <Badge variant='default' className='ml-auto px-1.5 py-0 text-[10px]'>{children}</Badge>
)

const SidebarMenuLink = ({ item }: { item: NavLink }) => {
    const { setOpenMobile } = useSidebar()
    const { pathname } = useLocation()
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={checkIsActive(pathname, item)}
                tooltip={item.title}
            >
                <Link to={item.url} onClick={() => setOpenMobile(false)} aria-current={checkIsActive(pathname, item) ? 'page' : undefined}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && <NavBadge>{item.badge}</NavBadge>}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

const SidebarMenuCollapsible = ({ item }: { item: NavCollapsible }) => {
    const { setOpenMobile } = useSidebar()
    const { pathname } = useLocation()
    return (
        <Collapsible
            asChild
            defaultOpen={checkIsActive(pathname, item)}
            className='group/collapsible'
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className='CollapsibleContent'>
                    <SidebarMenuSub>
                        {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={checkIsActive(pathname, subItem, item.items)}
                                >
                                    <Link to={subItem.url} onClick={() => setOpenMobile(false)} aria-current={checkIsActive(pathname, subItem, item.items) ? 'page' : undefined}>
                                        {subItem.icon && <subItem.icon />}
                                        <span>{subItem.title}</span>
                                        {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}

const SidebarMenuCollapsedDropdown = ({ item }: { item: NavCollapsible }) => {
    const { pathname } = useLocation()
    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        tooltip={item.title}
                        isActive={checkIsActive(pathname, item)}
                    >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='right' align='start' sideOffset={4}>
                    <DropdownMenuLabel>
                        {item.title} {item.badge ? `(${item.badge})` : ''}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items.map((sub) => (
                        <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                            <Link
                                to={sub.url}
                                className={checkIsActive(pathname, sub, item.items) ? 'bg-accent font-medium' : undefined}
                            >
                                {sub.icon && <sub.icon />}
                                <span className='max-w-52 text-wrap'>{sub.title}</span>
                                {sub.badge && (
                                    <span className='ml-auto text-xs'>{sub.badge}</span>
                                )}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}

/** Aktiv bei exakter Übereinstimmung oder bei Unterseiten (z. B. /links/42). Die Startseite nur exakt. */
function matchesPath(pathname: string, url: string, exact: boolean) {
    const path = pathname.split('?')[0].replace(/\/$/, '')
    if (path === url) return true
    if (exact || url === '/dashboard') return false
    return path.startsWith(url + '/')
}

function checkIsActive(pathname: string, item: NavItem | (NavLink & { items?: never }), siblings: { url: string }[] = []): boolean {
    if (item.items) return item.items.some((sub) => matchesPath(pathname, sub.url, false))
    // Ein Ziel, das Präfix eines Geschwister-Ziels ist (Homelab › Überblick), zählt nur exakt.
    const exact = siblings.some((s) => s.url !== item.url && s.url.startsWith(item.url + '/'))
    return matchesPath(pathname, item.url, exact)
}
