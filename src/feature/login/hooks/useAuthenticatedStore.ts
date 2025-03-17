import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {jwtDecode} from "jwt-decode";
import {LoginSchema} from "@/feature/login/schema/loginSchema.ts";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";

interface AuthenticatedUserState {
    jwt: string | null;
    user: UserTypeSchema | null;
    isLoading: boolean;
}

interface AuthenticatedUserActions {
    setJwt: (jwt: string) => void;
    setUser: (user: UserTypeSchema) => void;
    getUser: () => UserTypeSchema | null;
    isJwtValid: (jwt: string) => boolean;
    isAuthenticated: () => boolean;
    login: (data: LoginSchema) => Promise<void>;
    logout: () => void;
}

const initialState: AuthenticatedUserState = {
    jwt: null,
    user: null,
    isLoading: false,
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
            login: async (data: LoginSchema) => {
                set({ isLoading: true });
                try {
                    const response = await fetch(`${endpoint}/auth`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: data.email, password: data.password }),
                    });

                    if (!response.ok) {
                        if (response.status === 401) throw new Error("Invalid credentials");
                        if (response.status === 404) throw new Error("User not found");
                        throw new Error("Login failed");
                    }

                    const responseData = await response.json();
                    const jwt = responseData.data.token;
                    const user = responseData.data.user;
                    set({ jwt, user });
                } catch (error) {
                    console.error("Login error:", error);
                    throw error;
                } finally {
                    set({ isLoading: false });
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
