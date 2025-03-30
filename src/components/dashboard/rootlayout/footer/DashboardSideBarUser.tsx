import {LogOut, MoreVerticalIcon, Settings} from "lucide-react"

import {Avatar, AvatarFallback, AvatarImage,} from "@/components/ui/avatar.tsx"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import {NavLink} from "react-router-dom"
import {SidebarMenuButton, SidebarMenuItem, useSidebar} from "@/components/ui/sidebar.tsx";
import {splitAvatarUrl} from "@/lib/utils.ts";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";

interface NavUserProps {
    user: UserTypeSchema;
}

export function NavUser({user}: NavUserProps) {
    const {isMobile} = useSidebar()

    return (
        <SidebarMenuItem key='navUser'>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={splitAvatarUrl(user.avatarUrl)} alt={user.email}/>
                            <AvatarFallback className="rounded-lg"><strong>?</strong></AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user.username}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </span>
                        </div>
                        <MoreVerticalIcon className="ml-auto size-4"/>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={splitAvatarUrl(user.avatarUrl)} alt={user.email}/>
                                <AvatarFallback className="rounded-lg"><strong>?</strong></AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        <NavLink to={"/dashboard/self/settings"}>
                            <DropdownMenuItem>
                                <Settings/>
                                Settings
                            </DropdownMenuItem>
                        </NavLink>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <NavLink to="/logout">
                        <DropdownMenuItem>
                            <LogOut/>
                            Log out
                        </DropdownMenuItem>
                    </NavLink>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}