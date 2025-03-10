import StarBackground from "@/components/StarBackground.tsx";
import SiteLogo from "@/components/SiteLogo.tsx";
import LoginForm from "@/feature/login/components/LoginForm.tsx";

function Login() {
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
                    <LoginForm/>
                </div>
            </div>
        </>
    );
}

export default Login;