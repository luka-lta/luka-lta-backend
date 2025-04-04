import {Suspense} from "react";
import {appRouter} from "@/AppRouter.tsx";
import ErrorPage from "@/pages/ErrorPage.tsx";
import {RouterProvider} from "react-router-dom";
import {Toaster} from "sonner";
import {Analytics} from "@vercel/analytics/react"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "@/context/theme-context.tsx";
import {FontProvider} from "@/context/font-context.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                // eslint-disable-next-line no-console
                if (import.meta.env.DEV) console.log({failureCount, error})

                if (failureCount >= 0 && import.meta.env.DEV) return false
                if (failureCount > 3 && import.meta.env.PROD) return false

                return !(
                    error instanceof Error &&
                    [401, 403].includes(0)
                )
            },
            refetchOnWindowFocus: import.meta.env.PROD,
            staleTime: 10 * 1000, // 10s
        },
    },
});

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <QueryClientProvider client={queryClient}>
                <FontProvider>
                    <Suspense fallback={<ErrorPage/>}>
                        <RouterProvider router={appRouter}/>
                        <Toaster richColors/>
                    </Suspense>
                </FontProvider>
                <Analytics/>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;
