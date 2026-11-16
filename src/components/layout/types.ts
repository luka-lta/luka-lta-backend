import { LucideIcon } from "lucide-react";

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
    items: (BaseNavItem & { url: string })[]
    url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
    /** Ohne Titel wird die Gruppe ohne Überschrift dargestellt. */
    title?: string
    items: NavItem[]
}

interface SidebarData {
    navGroups: NavGroup[]
    /** Sekundäre Ziele (Profil-Menü & Befehlspalette), nicht in der Hauptnavigation. */
    accountLinks: NavLink[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
