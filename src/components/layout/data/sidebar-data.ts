import { type SidebarData } from '../types'
import {
    Eye,
    Hammer,
    KeySquare, LayoutDashboardIcon,
    ListTree, Palette, RssIcon, Settings,
    ShieldHalfIcon, UserCog,
    UsersIcon, Wrench
} from "lucide-react";

export const sidebarData: SidebarData = {
    navGroups: [
        {
            title: 'General',
            items: [
                {
                    title: 'Dashboard',
                    url: '/dashboard',
                    icon: LayoutDashboardIcon,
                },
                {
                    title: "Tools",
                    url: '/dashboard/tools',
                    icon: Hammer,
                },
                {
                    title: 'Notifications',
                    url: '/dashboard/notifications',
                    icon: RssIcon
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
            ],
        },
        {
            title: 'Other',
            items: [
                {
                    title: 'Settings',
                    icon: Settings,
                    items: [
                        {
                            title: 'Profile',
                            url: '/dashboard/settings',
                            icon: UserCog,
                        },
                        {
                            title: 'Account',
                            url: '/dashboard/settings/account',
                            icon: Wrench
                        },
                        {
                            title: 'Appearance',
                            url: '/dashboard/settings/appearance',
                            icon: Palette,
                        },
                    ]
                },
            ],
        },
    ],
}
