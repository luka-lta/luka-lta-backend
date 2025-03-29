import {createBrowserRouter, redirect} from "react-router-dom";
import ErrorPage from "@/pages/ErrorPage.tsx";
import DashboardPage from "@/pages/Dashboard/DashboardPage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import DashboardRootLayout from "@/components/dashboard/rootlayout/DashboardRootLayout.tsx";
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
import RegisterPage from "@/pages/RegisterPage.tsx";
import PreviewAccessPage from "@/pages/Dashboard/PreviewAccessPage.tsx";
import PermissionsPage from "@/pages/Dashboard/PermissionsPage.tsx";
import SelfOverviewPage from "@/pages/Dashboard/SelfOverviewPage.tsx";

export const appRouter = createBrowserRouter([
    {
        id: 'root',
        path: '/',
        loader: authenticatedLoader,
        element: <LoginPage/>,
        errorElement: <ErrorPage/>
    },
    {
        path: '/register',
        element: <RegisterPage/>,
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
                path: 'preview-access',
                element: <PreviewAccessPage/>,
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
            },
            {
                path: 'permissions',
                element: <PermissionsPage/>
            },
            {
                path: 'self/settings',
                element: <SelfOverviewPage/>
            }
        ]
    },
    {
        path: "logout",
        loader() {
            useAuthenticatedUserStore.getState().logout();
            return redirect('/');
        }
    },
])