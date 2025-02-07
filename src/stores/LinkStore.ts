import {create} from 'zustand'
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";

const endpoint = import.meta.env.VITE_API_URL + '/linkCollection';

interface LinkTreeStore {
    links: LinkItemTypeSchema[];
    isLoading: boolean;
    error: string | null;
    fetchLinks: () => Promise<void>;
    updateLink: (id: number, updatedData: Partial<LinkItemTypeSchema>) => Promise<void>;
    deleteLink: (id: number) => Promise<void>;
    addLink: (newLink: Partial<LinkItemTypeSchema>) => Promise<void>;
    triggerFetch: () => void;
}

export const useLinkStore = create<LinkTreeStore>((set) => ({
    links: [],
    isLoading: false,
    error: null,

    fetchLinks: async () => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + '/', {
                headers: {
                    Authorization: `${jwt}`,
                },
            });
            if (!response.ok) throw new Error('Failed to load links');
            const data = await response.json();
            const links: LinkItemTypeSchema[] = data.links;
            set({ links, isLoading: false });
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    updateLink: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + `/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${jwt}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Failed to update link');
            const data = await response.json();
            const updatedLink: LinkItemTypeSchema = data.link;

            set((state) => ({
                links: state.links.map((link) =>
                    link.id === id ? { ...link, ...updatedLink } : link
                ),
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    deleteLink: async (id) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + `/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `${jwt}`,
                },
            });
            if (!response.ok) throw new Error('Failed to delete link');

            set((state) => ({
                links: state.links.filter((link) => link.id !== id),
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },

    addLink: async (newLink) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${jwt}`,
                },
                body: JSON.stringify(newLink),
            });
            if (!response.ok) throw new Error('Failed to add new link');
            const data = await response.json();
            const addedLink: LinkItemTypeSchema = data.link;

            set((state) => ({
                links: [...state.links, addedLink],
                isLoading: false,
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },
    triggerFetch: () => {
        const fetchLinks = useLinkStore.getState().fetchLinks;
        fetchLinks();
    },
}));

export default useLinkStore;

