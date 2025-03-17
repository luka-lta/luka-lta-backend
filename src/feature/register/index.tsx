import SiteLogo from "@/components/SiteLogo.tsx";
import RegisterForm from "@/feature/register/components/RegisterForm.tsx";

function Register() {
    return (
        <>
            <div className="w-screen h-screen items-center flex flex-1 flex-col justify-center px-6 py-12 lg:px-8 z-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm z-10">
                    <SiteLogo className="mx-auto h-3 w-auto flex justify-center items-center"/>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight bg-black text-gray-300">
                        Backend Register
                    </h2>
                </div>

                <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm z-10 bg-black">
                    <RegisterForm/>
                </div>
            </div>
        </>
    );
}

export default Register;