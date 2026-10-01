import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {jwtDecode} from "jwt-decode";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";

interface AuthenticatedUserState {
    jwt: string | null;
    user: UserTypeSchema | null;
}

interface AuthenticatedUserActions {
    setJwt: (jwt: string) => void;
    setUser: (user: UserTypeSchema) => void;
    getUser: () => UserTypeSchema | null;
    isJwtValid: (jwt: string) => boolean;
    isAuthenticated: () => boolean;
    setAuth: (jwt: string, user: UserTypeSchema) => void;
    logout: () => void;
}

const initialState: AuthenticatedUserState = {
    jwt: null,
    user: null,
};

export const useAuthenticatedUserStore = create<AuthenticatedUserState & AuthenticatedUserActions>()(
    persist(
        (set, get) => ({
            ...initialState,
            setJwt: (jwt: string) => set({ jwt }),
            setUser: (user: UserTypeSchema) => set({ user }),
            isJwtValid: (jwt: string) => {
                try {
                    const parsedJwt = jwtDecode(jwt);
                    return 'exp' in parsedJwt && parsedJwt.exp ? parsedJwt.exp > Math.floor(Date.now() / 1000) : false;
                } catch (error) {
                    console.error("Error parsing JWT:", error);
                    return false;
                }
            },
            isAuthenticated: () => {
                const { jwt, isJwtValid } = get();
                return (jwt && isJwtValid(jwt)) === true;
            },
            getUser: () => get().user,
            setAuth: (jwt: string, user: UserTypeSchema) => set({ jwt, user }),

            logout: () => set({ ...initialState }),
        }),
        {
            name: "auth_user_store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
