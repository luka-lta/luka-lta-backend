import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/layout/app-sidebar.tsx";
import SkipToMain from "@/components/skip-to-main.tsx";
import { Header } from "./header";
import { Search } from "@/components/search.tsx";
import { ThemeSwitch } from "@/components/theme-switch.tsx";
import { SearchProvider } from "@/context/search-context.tsx";
import { DynamicBreadcrumb } from "@/components/layout/dynamic-breadcrumb.tsx";
import { NotificationBell } from "@/feature/notifications/components/NotificationBell.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";

/**
 * App-Shell: Sidebar links, Header oben, Seiteninhalt (PageContainer) darunter.
 * Seiten rendern selbst ihren <PageContainer>, damit Breite und Titel pro Seite steuerbar sind.
 */
export default function DashboardLayout() {
    return (
        <SearchProvider>
            <TooltipProvider delayDuration={300}>
                <SidebarProvider defaultOpen>
                    <SkipToMain />
                    <AppSidebar />
                    <SidebarInset className='min-w-0'>
                        <Header>
                            <DynamicBreadcrumb />
                            <div className='ml-auto flex items-center gap-1'>
                                <Search />
                                <NotificationBell />
                                <ThemeSwitch />
                            </div>
                        </Header>
                        <Outlet />
                    </SidebarInset>
                </SidebarProvider>
            </TooltipProvider>
        </SearchProvider>
    );
}
