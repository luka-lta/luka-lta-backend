import {createBrowserRouter, redirect} from "react-router-dom";
import ErrorPage from "@/pages/ErrorPage.tsx";
import DashboardPage from "@/pages/Dashboard/DashboardPage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import DashboardRootLayout from "@/components/dashboard/rootlayout/DashboardRootLayout.tsx";
import WorkAndProgressPage from "@/pages/WorkAndProgressPage.tsx";
import {ProfileSettingsPage} from "@/pages/Dashboard/ProfileSettingsPage.tsx";
import UsersPage from "@/pages/Dashboard/UsersPage.tsx";
import LinktreePage from "@/pages/Dashboard/LinktreePage.tsx";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";
import authenticatedLoader from "@/loader/authenticatedLoader.ts";
import protectedLoader from "@/loader/protectedLoader.ts";

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
                element: <LinktreePage/>
            },
            {
                path: 'analytics',
                element: <WorkAndProgressPage/>
            },
            {
                path: 'todos',
                element: <WorkAndProgressPage/>
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