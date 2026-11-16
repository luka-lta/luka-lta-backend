import { ChevronsUpDown, LogOut } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'
import { Link, useNavigate } from "react-router-dom";
import { UserTypeSchema } from "@/feature/user/schema/UserSchema.ts";
import { useAuthenticatedUserStore } from "@/store/authStore.ts";
import { UserAvatar } from "@/components/data/user-avatar.tsx";
import { sidebarData } from "@/components/layout/data/sidebar-data.ts";

/** Konto-Menü im Sidebar-Footer: Profil, Einstellungen, Abmelden. */
export function NavUser({ user }: { user: UserTypeSchema | null }) {
    const { isMobile, setOpenMobile } = useSidebar()
    const logout = useAuthenticatedUserStore((s) => s.logout)
    const navigate = useNavigate()

    if (!user) return null

    function handleLogout() {
        logout()
        navigate('/')
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            tooltip={user.username}
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <UserAvatar name={user.username} email={user.email} avatarUrl={user.avatarUrl} size='sm' />
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-medium'>{user.username}</span>
                                <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                            </div>
                            <ChevronsUpDown className='ml-auto size-4 text-muted-foreground' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-[--radix-dropdown-menu-trigger-width] min-w-56'
                        side={isMobile ? 'bottom' : 'right'}
                        align='end'
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className='flex items-center gap-2 font-normal'>
                            <UserAvatar name={user.username} email={user.email} avatarUrl={user.avatarUrl} size='sm' />
                            <div className='grid flex-1 text-sm leading-tight'>
                                <span className='truncate font-medium'>{user.username}</span>
                                <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {sidebarData.accountLinks.map((link) => (
                                <DropdownMenuItem key={link.url} asChild>
                                    <Link to={link.url} onClick={() => setOpenMobile(false)}>
                                        {link.icon && <link.icon />}
                                        {link.title}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleLogout}>
                            <LogOut />
                            Abmelden
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
