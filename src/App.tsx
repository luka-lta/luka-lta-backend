import {Suspense} from "react";
import {appRouter} from "@/AppRouter.tsx";
import ErrorPage from "@/pages/ErrorPage.tsx";
import {RouterProvider} from "react-router-dom";
import {ThemeProvider} from "@/assets/providers/ThemeProvider.tsx";
import {Toaster} from "sonner";
import { Analytics } from "@vercel/analytics/react"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 1000 * 60 * 5,
        },
    },
});

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <QueryClientProvider client={queryClient}>
                <Suspense fallback={<ErrorPage />}>
                    <RouterProvider router={appRouter} />
                    <Toaster richColors />
                </Suspense>
                <Analytics/>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;
