import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {UserTypeSchema} from "@/shemas/UserSchema.ts";
import {jwtDecode} from "jwt-decode";

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
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const initialState: AuthenticatedUserState = {
    jwt: null,
    user: null,
};

const endpoint = import.meta.env.VITE_API_URL;

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
            login: async (email: string, password: string) => {
                try {
                    const response = await fetch(`${endpoint}/auth`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!response.ok) {
                        if (response.status === 401) throw new Error("Invalid credentials");
                        if (response.status === 404) throw new Error("User not found");
                        throw new Error("Login failed");
                    }

                    const { jwt, user } = await response.json();
                    set({ jwt, user });
                } catch (error) {
                    console.error("Login error:", error);
                    throw error;
                }
            },

            logout: () => set({ ...initialState }),
        }),
        {
            name: "auth_user_store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
