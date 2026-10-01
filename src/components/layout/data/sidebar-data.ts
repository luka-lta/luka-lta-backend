import { type SidebarData } from '../types'
import {
    BookOpen,
    Boxes,
    Hammer,
    KeyRound,
    LayoutDashboardIcon,
    ListTree, MousePointerClickIcon, Palette, Server, Settings,
    UserCog,
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
                    title: 'Apps',
                    url: '/dashboard/apps',
                    icon: Boxes,
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
                    title: 'API Keys',
                    icon: KeyRound,
                    url: '/dashboard/api-keys',
                }
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
                    title: "Clicks",
                    icon: MousePointerClickIcon,
                    url: '/dashboard/clicks',
                }
            ],
        },
        {
            title: 'Homelab',
            items: [
                {
                    title: 'Homelab',
                    icon: Server,
                    url: '/dashboard/homelab',
                },
            ],
        },
        {
            title: 'Blog-Management',
            items: [
                {
                    title: 'Blog',
                    icon: BookOpen,
                    url: '/dashboard/blog',
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
