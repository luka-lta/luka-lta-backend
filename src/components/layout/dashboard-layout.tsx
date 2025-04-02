import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/layout/app-sidebar.tsx";
import {cn} from "@/lib/utils.ts";
import {Outlet} from "react-router-dom";
import SkipToMain from "@/components/skip-to-main.tsx";
import {Header} from "./header";
import {Search} from "@/components/search.tsx";
import {ThemeSwitch} from "@/components/theme-switch.tsx";
import {SearchProvider} from "@/context/search-context.tsx";
import {ProfileDropdown} from "@/components/profile-dropdown.tsx";

export default function DashboardLayout() {
    /*
        const defaultOpen = Cookies.get('sidebar:state') !== 'true'
    */

    return (
        <SearchProvider>
            <SidebarProvider defaultOpen={true}>
                <SkipToMain/>
                <AppSidebar/>
                <div
                    id='content'
                    className={cn(
                        'ml-auto w-full max-w-full',
                        'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
                        'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
                        'transition-[width] duration-200 ease-linear',
                        'flex h-svh flex-col',
                        'group-data-[scroll-locked=1]/body:h-full',
                        'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
                    )}
                >
                    <Header>
                        <Search/>
                        <div className='ml-auto flex items-center space-x-4'>
                            <ThemeSwitch/>
                            <ProfileDropdown/>
                        </div>
                    </Header>
                    <Outlet/>
                </div>
            </SidebarProvider>
        </SearchProvider>
    );
}