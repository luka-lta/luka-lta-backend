import {MoreHorizontal,} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar.tsx"
import SiteLogo from "@/components/SiteLogo"
import {NavUser} from "@/components/dashboard/rootlayout/DashboardSideBarUser"
import {NavLink, useLocation} from "react-router-dom"
import {useEffect, useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {NavItem} from "@/components/dashboard/rootlayout/types/SidebarTypes.ts";
import {navigation} from "@/components/dashboard/rootlayout/items/NavigationItems.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";

export default function DashboardSideBar() {
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(location.pathname);
    const { getUser } = useAuthenticatedUserStore();
    const user = getUser();


    useEffect(() => {
        setCurrentPage(location.pathname);
    }, [location]);

    const {isMobile} = useSidebar()

    const loadDropdownActions = (navItem: NavItem) => {
        if (navItem.dropdown?.length) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                            <MoreHorizontal/>
                            <span className="sr-only">More</span>
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-48 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                    >
                        {
                            navItem.dropdown.map((dropdownItem) => (
                                <DropdownMenuItem key={dropdownItem.url}>
                                    <dropdownItem.icon/>
                                    {dropdownItem.title}
                                </DropdownMenuItem>
                            ))
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="pt-5 items-center">
                <SiteLogo/>
            </ SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                navigation.navMain.map((navItem) => (
                                    <SidebarMenuItem key={navItem.title}>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <SidebarMenuButton
                                                        isActive={
                                                            navItem.url === '/dashboard' ? currentPage === '/dashboard' : currentPage.startsWith(`/dashboard/${navItem.url}`)
                                                        }
                                                        asChild>
                                                        <NavLink to={navItem.url}>
                                                            <navItem.icon/>
                                                            <span>{navItem.title}</span>
                                                        </NavLink>
                                                    </SidebarMenuButton>
                                                </TooltipTrigger>
                                                <TooltipContent side="right" align="center">
                                                    {navItem.title}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        {loadDropdownActions(navItem)}
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {user && <NavUser user={user} />}
            </SidebarFooter>
        </Sidebar>
    )
}