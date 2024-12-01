import {Navigation} from "@/components/dashboard/rootlayout/types/SidebarTypes.ts";
import {ChartSpline, ClipboardList, Home, ListTree, Plus, UsersIcon} from "lucide-react";

export const navigation: Navigation = {
    user: {
        name: "TEST",
        email: "test@test.de",
        avatar: "TT"
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