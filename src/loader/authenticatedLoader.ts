import {redirect} from "react-router-dom";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";

export default function authenticatedLoader() {
    const { isAuthenticated } = useAuthenticatedUserStore.getState();

    console.log(isAuthenticated())

    if (isAuthenticated()) {
        return redirect("/dashboard");
    }

    return null;
}