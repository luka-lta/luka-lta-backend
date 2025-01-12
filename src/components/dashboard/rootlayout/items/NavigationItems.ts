import {Navigation} from "@/components/dashboard/rootlayout/types/SidebarTypes.ts";
import {ChartSpline, ClipboardList, Home, KeySquare, ListTree, Plus, UsersIcon} from "lucide-react";

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
            title: "Users",
            url: "users",
            icon: UsersIcon,
            dropdown: [
                {
                    title: "Create User",
                    url: "/user/create",
                    icon: Plus,
                }
            ]
        },
        {
            title: "Linktree",
            url: "linktree",
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
            icon: KeySquare,
            dropdown: []
        },
        {
            title: "Analytics",
            url: "analytics",
            icon: ChartSpline,
            dropdown: []
        },
        {
            title: "Todos",
            url: "todos",
            icon: ClipboardList,
            dropdown: []
        }
    ]
}