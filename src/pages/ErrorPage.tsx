import {Link} from "react-router-dom";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";

function ErrorPage() {
    const { isAuthenticated } = useAuthenticatedUserStore();

    const renderGoToDashboardButton = () => {
        if (isAuthenticated()) {
            return (
                <Link
                    to={"/dashboard"}
                    className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    Go to dashboard
                </Link>
            )
        }
    };

    return (
        <div
            className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 z-20">
            <div className="mx-auto max-w-md text-center">
                <h1 className="text-9xl font-bold tracking-tight text-primary bg-black">404</h1>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    Oops, the page you were looking for does not exist.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        to={"/"}
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Go to landing page
                    </Link>
                    {renderGoToDashboardButton()}
                </div>
            </div>
        </div>
    );
}

export default ErrorPage;