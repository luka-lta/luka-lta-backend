import { type SidebarData } from '../types'
import {
    BookOpen,
    Boxes,
    CalendarDays,
    CloudSun,
    Container as ContainerIcon,
    FolderKanban,
    Hammer,
    KeyRound,
    LayoutDashboardIcon,
    LayoutGrid,
    ListTree, MousePointerClickIcon, Network, Palette, Server, Settings,
    UserCog,
    UsersIcon, Wallet, Wrench
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
                },
                {
                    title: 'Business',
                    url: '/dashboard/business',
                    icon: Wallet,
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
                    items: [
                        {
                            title: 'Overview',
                            url: '/dashboard/homelab',
                            icon: LayoutGrid,
                        },
                        {
                            title: 'Containers',
                            url: '/dashboard/homelab/containers',
                            icon: ContainerIcon,
                        },
                        {
                            title: 'Topology',
                            url: '/dashboard/homelab/topology',
                            icon: Network,
                        },
                    ],
                },
            ],
        },
        {
            title: 'Personal',
            items: [
                {
                    title: 'Calendar',
                    icon: CalendarDays,
                    url: '/dashboard/calendar',
                },
                {
                    title: 'Weather',
                    icon: CloudSun,
                    url: '/dashboard/weather',
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
            title: 'Portfolio-Management',
            items: [
                { title: 'Projects', icon: FolderKanban, url: '/dashboard/projects' },
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
