import {LucideIcon} from "lucide-react";

interface BaseNavItem {
    title: string
    badge?: string
    icon?: LucideIcon
}

type NavLink = BaseNavItem & {
    url: string
    items?: never
}

type NavCollapsible = BaseNavItem & {
    items: (BaseNavItem & { url: '/' })[]
    url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
    title: string
    items: NavItem[]
}

interface SidebarData {
    navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
