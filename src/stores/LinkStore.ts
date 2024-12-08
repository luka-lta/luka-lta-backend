import {create} from 'zustand'
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";

const url = 'http://localhost/api/v1';
const endpoint = url + '/linkCollection';

interface LinkTreeStore {
    links: LinkItemTypeSchema[];
    isLoading: boolean;
    error: string | null;
    fetchLinks: () => Promise<void>;
    updateLink: (id: number, updatedData: Partial<LinkItemTypeSchema>) => Promise<void>;
    deleteLink: (id: number) => Promise<void>;
    addLink: (newLink: LinkItemTypeSchema) => Promise<void>;
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
            const response = await fetch(endpoint + '/links', {
                headers: {
                    Authorization: `${jwt}`,
                },
            }); // Passe den API-Endpunkt an
            if (!response.ok) throw new Error('Failed to load links');
            const data = await response.json();
            const links: LinkItemTypeSchema[] = data.links;
            set({ links, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateLink: async (id, updatedData) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + `/link/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${jwt}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Failed to update link');
            const updatedLink: LinkItemTypeSchema = await response.json();

            set((state) => ({
                links: state.links.map((link) =>
                    link.id === id ? { ...link, ...updatedLink } : link
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    deleteLink: async (id) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + `links/${id}`, {
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
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addLink: async (newLink: LinkItemTypeSchema) => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + '/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${jwt}`,
                },
                body: JSON.stringify(newLink),
            });
            if (!response.ok) throw new Error('Failed to add new link');
            const addedLink: LinkItemTypeSchema = await response.json();

            set((state) => ({
                links: [...state.links, addedLink],
                isLoading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },
    triggerFetch: () => {
        const fetchLinks = useLinkStore.getState().fetchLinks;
        fetchLinks();
    },
}));

export default useLinkStore;

