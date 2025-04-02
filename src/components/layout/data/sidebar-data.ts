import { type SidebarData } from '../types'
import {
    ChartSpline,
    ClipboardList,
    DatabaseZap,
    Eye,
    Hammer,
    Home,
    KeySquare,
    ListTree, Settings,
    ShieldHalfIcon,
    UsersIcon
} from "lucide-react";

export const sidebarData: SidebarData = {
    navGroups: [
        {
            title: 'General',
            items: [
                {
                    title: 'Home',
                    url: '/dashboard',
                    icon: Home,
                },
                {
                    title: "Admin",
                    url: '/dashboard/admin',
                    icon: DatabaseZap,
                },
                {
                    title: "Todos",
                    url: '/dashboard/todos',
                    icon: ClipboardList,
                },
                {
                    title: "Tools",
                    url: '/dashboard/tools',
                    icon: Hammer,
                }
            ],
        },
        {
            title: 'Access-Management',
            items: [
                {
                    title: 'Users',
                    icon: UsersIcon,
                    url: '/dashboard/users',
                },
                {
                    title: "Preview Access",
                    icon: Eye,
                    url: '/dashboard/preview-access',
                },
                {
                    title: "Api-Keys",
                    icon: KeySquare,
                    url: '/dashboard/api-keys',
                },
                {
                    title: "Permissions",
                    icon: ShieldHalfIcon,
                    url: '/dashboard/permissions',
                },
            ],
        },
        {
            title: 'Linktree-Management',
            items: [
                {
                    title: "Linktree",
                    icon: ListTree,
                    url: '/dashboard/linktree',
                },
                {
                    title: "Analytics",
                    icon: ChartSpline,
                    url: '/dashboard/analytics',
                },
            ],
        },
        {
            title: 'Other',
            items: [
                {
                    title: 'Settings',
                    icon: Settings,
                    url: '/dashboard/self/settings',
                },
            ],
        },
    ],
}
