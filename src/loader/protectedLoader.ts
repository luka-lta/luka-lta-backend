import {redirect} from "react-router-dom";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";

export default function protectedLoader() {
    const { isAuthenticated } = useAuthenticatedUserStore.getState();

    if (isAuthenticated()) {
        return null;
    }

    return redirect('/');
}