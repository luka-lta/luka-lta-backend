import StarBackground from "@/components/StarBackground.tsx";
import SiteLogo from "@/components/SiteLogo.tsx";
import * as React from "react";
import {Toaster} from "sonner";
import LoginForm from "@/components/dashboard/LoginForm.tsx";

export default function LoginPage() {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    return (
        <>
            <StarBackground/>
            <div className="w-screen h-screen items-center flex flex-1 flex-col justify-center px-6 py-12 lg:px-8 z-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm z-10">
                    <SiteLogo className="mx-auto h-3 w-auto flex justify-center items-center"/>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight bg-black text-gray-300">
                        Backend Login
                    </h2>
                </div>

                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm z-10 bg-black">
                    <div className={`${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
                        <LoginForm setIsLoading={setIsLoading} isLoading={isLoading} />
                    </div>
                </div>
            </div>
            <Toaster />
        </>
    )
}