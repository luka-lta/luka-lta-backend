import {Navigation} from "@/components/dashboard/rootlayout/types/SidebarTypes.ts";
import {
    ChartSpline,
    ClipboardList, DatabaseZap,
    Eye,
    Hammer,
    Home,
    KeySquare,
    ListTree,
    Plus,
    ShieldHalfIcon,
    UsersIcon
} from "lucide-react";

export const navigation: Navigation = {
    user: {
        name: "TEST",
        email: "test@test.de",
        avatar: "https://avatars.githubusercontent.com/u/67432564?s=400&u=725e1ed64ea2108364b514fa74405600f168242b&v=4"
    },
    navMain: [
        {
            title: "Home",
            url: "/dashboard",
            icon: Home,
            dropdown: []
        },
        {
            title: "Admin",
            url: "admin",
            icon: DatabaseZap,
            dropdown: []
        },
        {
            title: "Users",
            url: "users",
            icon: UsersIcon,
            groupLabel: "Access Management",
            dropdown: [
                {
                    title: "Create User",
                    url: "/user/create",
                    icon: Plus,
                }
            ]
        },
        {
            title: "Preview Access",
            url: "preview-access",
            icon: Eye,
            groupLabel: "Access Management",
            dropdown: []
        },
        {
            title: "Linktree",
            url: "linktree",
            groupLabel: "Linktree Management",
            icon: ListTree,
            dropdown: [
                {
                    title: "Create new link",
                    url: "/linktree/create",
                    icon: Plus,
                }
            ]
        },
        {
            title: "Api-Keys",
            url: "api-keys",
            groupLabel: "Access Management",
            icon: KeySquare,
            dropdown: []
        },
        {
            title: "Permissions",
            url: "permissions",
            groupLabel: "Access Management",
            icon: ShieldHalfIcon,
            dropdown: []
        },
        {
            title: "Analytics",
            groupLabel: "Linktree Management",
            url: "analytics",
            icon: ChartSpline,
            dropdown: []
        },
        {
            title: "Todos",
            url: "todos",
            icon: ClipboardList,
            dropdown: []
        },
        {
            title: "Tools",
            url: "tools",
            icon: Hammer,
            dropdown: []
        }
    ]
}