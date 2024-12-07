import {Suspense} from "react";
import {appRouter} from "@/AppRouter.tsx";
import ErrorPage from "@/pages/ErrorPage.tsx";
import {RouterProvider} from "react-router-dom";
import {ThemeProvider} from "@/assets/providers/ThemeProvider.tsx";

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <Suspense fallback={<ErrorPage />}>
                <RouterProvider router={appRouter} />
            </Suspense>
        </ThemeProvider>
    );
}

export default App;
