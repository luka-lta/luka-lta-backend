import {ThemeProvider} from "@/assets/proivders/ThemeProvider.tsx";
import {appRouter} from "@/AppRouter.tsx";
import ErrorPage from "@/pages/ErrorPage.tsx";
import {RouterProvider} from "react-router-dom";

function App() {
  return (
      <ThemeProvider defaultTheme='system' storageKey='ui-theme'>
          <RouterProvider router={appRouter} fallbackElement={<ErrorPage/>}/>
      </ThemeProvider>
  )
}

export default App
