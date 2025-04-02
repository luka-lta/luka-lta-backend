import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { sidebarData } from './data/sidebar-data'
import SiteLogo from "@/components/SiteLogo.tsx";
import React from "react";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const {getUser} = useAuthenticatedUserStore();
    const user = getUser();

    return (
        <Sidebar collapsible='icon' variant='sidebar' {...props}>
            <SidebarHeader>
                <SiteLogo/>
            </SidebarHeader>
            <SidebarContent>
                {sidebarData.navGroups.map((props) => (
                    <NavGroup key={props.title} {...props} />
                ))}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
