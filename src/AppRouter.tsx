import {createBrowserRouter, redirect} from "react-router-dom";
import ErrorPage from "@/pages/ErrorPage.tsx";
import DashboardPage from "@/pages/Dashboard/DashboardPage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import DashboardRootLayout from "@/components/dashboard/rootlayout/DashboardRootLayout.tsx";
import {ProfileSettingsPage} from "@/pages/Dashboard/ProfileSettingsPage.tsx";
import UsersPage from "@/pages/Dashboard/UsersPage.tsx";
import LinktreePage from "@/pages/Dashboard/LinktreePage.tsx";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";
import authenticatedLoader from "@/loader/authenticatedLoader.ts";
import protectedLoader from "@/loader/protectedLoader.ts";
import AnalyticsPage from "@/pages/Dashboard/AnalyticsPage.tsx";
import ApiKeysPage from "@/pages/Dashboard/ApiKeysPage.tsx";
import TodoPage from "@/pages/Dashboard/TodoPage.tsx";
import ToolsPage from "@/pages/Dashboard/ToolsPage.tsx";
import DetailLinktree from "@/feature/linktree/childPages/detail/DetailLinktree.tsx";

export const appRouter = createBrowserRouter([
    {
        id: 'root',
        path: '/',
        loader: authenticatedLoader,
        element: <LoginPage/>,
        errorElement: <ErrorPage/>
    },
    {
        path: '/dashboard',
        element: <DashboardRootLayout/>,
        loader: protectedLoader,
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
                path: 'api-keys',
                element: <ApiKeysPage/>
            },
            {
                path: 'analytics',
                element: <AnalyticsPage/>
            },
            {
                path: 'todos',
                element: <TodoPage/>
            },
            {
                path: 'tools',
                element: <ToolsPage/>
            }
        ]
    },
    {
        path: '/dashboard/settings',
        loader: protectedLoader,
        element: <ProfileSettingsPage/>
    },
    {
        path: "logout",
        loader() {
            useAuthenticatedUserStore.getState().logout();
            return redirect('/');
        }
    },
])