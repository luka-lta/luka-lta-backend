import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {User} from "@/shemas/UserSchema.ts";
import {jwtDecode} from "jwt-decode";

interface AuthenticatedUserState {
    jwt: string | null;
    user: User | null;
}

interface AuthenticatedUserActions {
    setJwt: (jwt: string) => void;
    setUser: (user: User) => void;
    getUser: () => User | null;
    isJwtValid: (jwt: string) => boolean;
    isAuthenticated: () => boolean;
    login: (email: string, password: string) => Promise<void>;
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
            setUser: (user: User) => set({ user }),
            isJwtValid: (jwt: string) => {
                try {
                    const parsedJwt = jwtDecode(jwt);
                    return 'exp' in parsedJwt && parsedJwt.exp ? parsedJwt.exp > Math.floor(Date.now() / 1000) : false;
                } catch (e) {
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
                    const response = await fetch("https://api.luka-lta.dev/api/v1/auth", {
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
