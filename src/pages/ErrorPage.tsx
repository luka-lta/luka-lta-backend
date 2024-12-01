import {Link} from "react-router-dom";

function ErrorPage() {
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
                </div>
            </div>
        </div>
    );
}

export default ErrorPage;