import {createBrowserRouter, redirect} from "react-router-dom";
import ErrorPage from "@/pages/ErrorPage.tsx";
import DashboardPage from "@/pages/Dashboard/DashboardPage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import UsersPage from "@/pages/Dashboard/UsersPage.tsx";
import LinktreePage from "@/pages/Dashboard/LinktreePage.tsx";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";
import authenticatedLoader from "@/loader/authenticatedLoader.ts";
import protectedLoader from "@/loader/protectedLoader.ts";
import ApiKeysPage from "@/pages/Dashboard/ApiKeysPage.tsx";
import ToolsPage from "@/pages/Dashboard/ToolsPage.tsx";
import DetailLinktree from "@/feature/linktree/childPages/detail/DetailLinktree.tsx";
import RegisterPage from "@/pages/RegisterPage.tsx";
import PreviewAccessPage from "@/pages/Dashboard/PreviewAccessPage.tsx";
import PermissionsPage from "@/pages/Dashboard/PermissionsPage.tsx";
import DashboardLayout from "@/components/layout/dashboard-layout.tsx";
import Settings from "@/feature/SelfOverview";
import SettingsProfile from "@/feature/SelfOverview/profile";
import ComingSoon from "@/components/coming-soon.tsx";
import SettingsAppearance from "@/feature/SelfOverview/appearance";

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
        element: <DashboardLayout/>,
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
                path: 'tools',
                element: <ToolsPage/>
            },
            {
                path: 'permissions',
                element: <PermissionsPage/>
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