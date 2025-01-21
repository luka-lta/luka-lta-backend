import {UserTypeSchema} from "@/shemas/UserSchema.ts";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";
import {create} from "zustand";

const endpoint = import.meta.env.VITE_API_URL;

interface UserStore {
    users: UserTypeSchema[];
    isLoading: boolean;
    error: string | null;
    fetchUser: () => Promise<void>;
    updateUser: (id: number, updatedData: Partial<UserTypeSchema>) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
    addUser: (newUser: UserTypeSchema) => Promise<void>;
    triggerFetch: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    users: [],
    isLoading: false,
    error: null,

    fetchUser: async () => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + '/user/', {
                headers: {
                    Authorization: `${jwt}`,
                },
            }); // Passe den API-Endpunkt an
            if (!response.ok) throw new Error('Failed to load user');
            const data = await response.json();
            const users: UserTypeSchema[] = data.users;
            set({ users, isLoading: false });
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    updateUser: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + `/user/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${jwt}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Failed to update user');
            const updatedUser: UserTypeSchema = await response.json();

            set((state) => ({
                user: state.users.map((user) =>
                    user.userId === id ? { ...user, ...updatedUser } : user
                ),
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },
    deleteUser: async (id) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + `/user/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `${jwt}`,
                },
            });
            if (!response.ok) throw new Error('Failed to delete user');
            set((state) => ({
                user: state.users.filter((user) => user.userId !== id),
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },
    addUser: async (newUser) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${jwt}`,
                },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) throw new Error('Failed to add user');
            const addedUser: UserTypeSchema = await response.json();
            set((state) => ({
                user: [...state.users, addedUser],
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },
    triggerFetch: () => {
        const fetchUser = useUserStore.getState().fetchUser;
        fetchUser();
    },
}));

export default useUserStore;
