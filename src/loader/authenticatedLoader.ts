import {redirect} from "react-router-dom";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";

export default function authenticatedLoader() {
    const { isAuthenticated } = useAuthenticatedUserStore.getState();

    console.log(isAuthenticated())

    if (isAuthenticated()) {
        return redirect("/dashboard");
    }

    return null;
}