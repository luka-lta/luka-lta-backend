import { type SidebarData } from '../types'
import {
    BarChart3,
    Bell,
    BookOpen,
    Boxes,
    CalendarDays,
    CloudSun,
    Container as ContainerIcon,
    FolderKanban,
    KeyRound,
    LayoutDashboard,
    LayoutGrid,
    Link2,
    MousePointerClick,
    Network,
    Palette,
    Server,
    ShieldCheck,
    UserCog,
    Users,
    Wrench,
} from "lucide-react";

/**
 * Hauptnavigation, gruppiert nach Aufgaben (nicht nach Technik).
 * Reihenfolge = Nutzungshäufigkeit innerhalb der Gruppe.
 */
export const sidebarData: SidebarData = {
    navGroups: [
        {
            items: [
                { title: 'Übersicht', url: '/dashboard', icon: LayoutDashboard },
            ],
        },
        {
            title: 'Inhalte',
            items: [
                { title: 'Projekte', url: '/dashboard/projects', icon: FolderKanban },
                { title: 'Blog', url: '/dashboard/blog', icon: BookOpen },
                { title: 'Links', url: '/dashboard/linktree', icon: Link2 },
            ],
        },
        {
            title: 'Analyse',
            items: [
                { title: 'Klicks', url: '/dashboard/clicks', icon: MousePointerClick },
                { title: 'Business', url: '/dashboard/business', icon: BarChart3 },
                { title: 'Apps', url: '/dashboard/apps', icon: Boxes },
            ],
        },
        {
            title: 'Infrastruktur',
            items: [
                {
                    title: 'Homelab',
                    icon: Server,
                    items: [
                        { title: 'Überblick', url: '/dashboard/homelab', icon: LayoutGrid },
                        { title: 'Container', url: '/dashboard/homelab/containers', icon: ContainerIcon },
                        { title: 'Topologie', url: '/dashboard/homelab/topology', icon: Network },
                    ],
                },
            ],
        },
        {
            title: 'Persönlich',
            items: [
                { title: 'Kalender', url: '/dashboard/calendar', icon: CalendarDays },
                { title: 'Wetter', url: '/dashboard/weather', icon: CloudSun },
                { title: 'Tools', url: '/dashboard/tools', icon: Wrench },
            ],
        },
        {
            title: 'Administration',
            items: [
                { title: 'Benutzer', url: '/dashboard/users', icon: Users },
                { title: 'API-Keys', url: '/dashboard/api-keys', icon: KeyRound },
            ],
        },
    ],
    accountLinks: [
        { title: 'Profil', url: '/dashboard/settings', icon: UserCog },
        { title: 'Konto & Sicherheit', url: '/dashboard/settings/account', icon: ShieldCheck },
        { title: 'Darstellung', url: '/dashboard/settings/appearance', icon: Palette },
        { title: 'Benachrichtigungen', url: '/dashboard/notifications', icon: Bell },
    ],
}

