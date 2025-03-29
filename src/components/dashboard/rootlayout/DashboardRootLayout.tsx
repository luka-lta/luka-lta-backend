import {NavLink, Outlet} from "react-router-dom";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Toaster} from "sonner";
import {DynamicBreadcrumb} from "@/components/DynamicBreadCrump.tsx";
import DashboardSideBar from "@/components/dashboard/rootlayout/DashboardSideBar.tsx";
import {Info, LogOut, Moon, Sun} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";
import {useTheme} from "@/assets/providers/ThemeProvider.tsx";
import UserAvatar from "@/components/UserAvatar.tsx";

export default function DashboardRootLayout() {
    const {getUser} = useAuthenticatedUserStore();
    const user = getUser();
    const {setTheme, theme} = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <SidebarProvider>
                <DashboardSideBar/>
                <SidebarInset>
                    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background w-full">
                        <div className="flex items-center justify-between w-full px-4">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <SidebarTrigger className="-ml-1"/>
                                <Separator orientation="vertical" className="mr-2 h-4"/>
                                <DynamicBreadcrumb/>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                <Button
                                    variant='ghost'
                                    className="p-2 rounded-full hover:bg-muted"
                                    onClick={toggleTheme}
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="h-4 w-4"/>
                                    ) : (
                                        <Moon className="h-4 w-4"/>
                                    )}
                                </Button>
                                <Button variant='ghost' className="p-2 rounded-full hover:bg-muted">
                                    <Info className="h-4 w-4"/>
                                </Button>
                                <Button variant='ghost' className="p-2 rounded-full hover:bg-muted">
                                    <NavLink to={'/logout'}>
                                        <LogOut className="h-4 w-4"/>
                                    </NavLink>
                                </Button>
                                <div
                                    className="flex items-center justify-center h-8 w-8 rounded-full text-primary-foreground text-sm font-medium">
                                    <UserAvatar avatar={user?.avatarUrl ?? ''} alt={user?.email ?? ''}
                                                className="h-8 w-8 rounded-lg"/>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="p-4">
                        <Outlet/>
                    </main>
                </SidebarInset>
            </SidebarProvider>
            <Toaster/>
        </>
    );
}