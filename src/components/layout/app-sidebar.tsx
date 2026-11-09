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
import { useAuthenticatedUserStore } from "@/store/authStore.ts";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const user = useAuthenticatedUserStore((s) => s.getUser());

    return (
        <Sidebar collapsible='icon' variant='sidebar' aria-label='Hauptnavigation' {...props}>
            <SidebarHeader className='h-14 justify-center border-b border-sidebar-border px-3'>
                <SiteLogo />
            </SidebarHeader>
            <SidebarContent className='py-2'>
                {sidebarData.navGroups.map((group, index) => (
                    <NavGroup key={group.title ?? index} {...group} />
                ))}
            </SidebarContent>
            <SidebarFooter className='border-t border-sidebar-border'>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
