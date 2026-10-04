import {createBrowserRouter, Navigate} from "react-router-dom";
import ErrorPage from "@/pages/ErrorPage.tsx";
import DashboardPage from "@/pages/Dashboard/DashboardPage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import UsersPage from "@/pages/Dashboard/UsersPage.tsx";
import LinktreePage from "@/pages/Dashboard/LinktreePage.tsx";
import {useAuthenticatedUserStore} from "@/store/authStore.ts";
import ToolsPage from "@/pages/Dashboard/ToolsPage.tsx";
import AppsPage from "@/pages/Dashboard/AppsPage.tsx";
import AppDetailPage from "@/pages/Dashboard/AppDetailPage.tsx";
import DetailLinktree from "@/feature/linktree/childPages/detail/DetailLinktree.tsx";
import DashboardLayout from "@/components/layout/dashboard-layout.tsx";
import Settings from "@/feature/SelfOverview";
import SettingsProfile from "@/feature/SelfOverview/profile";
import ComingSoon from "@/components/coming-soon.tsx";
import SettingsAppearance from "@/feature/SelfOverview/appearance";
import ClicksPage from "@/pages/Dashboard/ClicksPage.tsx";
import BlogPage from "@/pages/Dashboard/BlogPage.tsx";
import BlogCreatePage from "@/pages/Dashboard/BlogCreatePage.tsx";
import BlogDetailPage from "@/pages/Dashboard/BlogDetailPage.tsx";
import HomelabLayout from "@/feature/homelab/HomelabLayout.tsx";
import OverviewPage from "@/feature/homelab/pages/OverviewPage.tsx";
import ContainersPage from "@/feature/homelab/pages/ContainersPage.tsx";
import TopologyPage from "@/feature/homelab/pages/TopologyPage.tsx";
import ApiKeysPage from "@/pages/Dashboard/ApiKeysPage.tsx";
import CalendarPage from "@/pages/Dashboard/CalendarPage.tsx";
import WeatherPage from "@/pages/Dashboard/WeatherPage.tsx";
import BusinessPage from "@/pages/Dashboard/BusinessPage.tsx";
import NotificationsPage from "@/pages/Dashboard/NotificationsPage.tsx";
import ProjectsPage from "@/pages/Dashboard/ProjectsPage.tsx";

// eslint-disable-next-line react-refresh/only-export-components
function RequireAuth({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthenticatedUserStore((s) => s.isAuthenticated);
    if (!isAuthenticated()) return <Navigate to="/" replace />;
    return <>{children}</>;
}

// eslint-disable-next-line react-refresh/only-export-components
function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthenticatedUserStore((s) => s.isAuthenticated);
    if (isAuthenticated()) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

export const appRouter = createBrowserRouter([
    {
        id: 'root',
        path: '/',
        element: <RedirectIfAuthenticated><LoginPage/></RedirectIfAuthenticated>,
        errorElement: <ErrorPage/>
    },
    {
        path: '/dashboard',
        element: <RequireAuth><DashboardLayout/></RequireAuth>,
        children: [
            {
                path: '',
                element: <DashboardPage/>
            },
            {
                path: 'users',
                element: <UsersPage/>
            },
            {
                path: 'linktree',
                children: [
                    {
                        path: '',
                        element: <LinktreePage/>
                    },
                    {
                        path: ':linkId',
                        element: <DetailLinktree/>
                    }
                ]
            },
            {
                path: 'clicks',
                element: <ClicksPage />
            },
            {
                path: 'business',
                element: <BusinessPage />
            },
            {
                path: 'tools',
                element: <ToolsPage/>
            },
            {
                path: 'apps',
                element: <AppsPage/>
            },
            {
                path: 'apps/:appId',
                element: <AppDetailPage/>
            },
            {
                path: 'homelab',
                element: <HomelabLayout/>,
                children: [
                    {
                        path: '',
                        element: <OverviewPage/>
                    },
                    {
                        path: 'containers',
                        element: <ContainersPage/>
                    },
                    {
                        path: 'topology',
                        element: <TopologyPage/>
                    },
                ],
            },
            {
                path: 'api-keys',
                element: <ApiKeysPage/>
            },
            {
                path: 'calendar',
                element: <CalendarPage/>
            },
            {
                path: 'weather',
                element: <WeatherPage/>
            },
            {
                path: 'notifications',
                element: <NotificationsPage/>
            },
            {
                path: 'projects',
                element: <ProjectsPage/>
            },
            {
                path: 'settings',
                element: <Settings/>,
                children: [
                    {
                        path: '',
                        element: <SettingsProfile/>
                    },
                    {
                        path: 'appearance',
                        element: <SettingsAppearance/>
                    },
                    {
                        path: '*',
                        element: <ComingSoon/>
                    }
                ],
            },
            {
                path: 'blog',
                children: [
                    {
                        path: '',
                        element: <BlogPage />,
                    },
                    {
                        path: 'create',
                        element: <BlogCreatePage />,
                    },
                    {
                        path: ':blogId',
                        element: <BlogDetailPage />,
                    },
                ],
            },
        ]
    },
])
