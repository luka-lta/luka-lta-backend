import { create } from 'zustand'
import {LinkTreeStore} from "@/lib/types/LinkItemType.ts";
import {LinkItemTypeSchema} from "@/lib/LinkTypes.ts";

const url = 'http://localhost/api/v1';
const endpoint = url + '/linkCollection';

export const useLinkStore = create<LinkTreeStore>((set) => ({
    links: [],
    isLoading: false,
    error: null,

    fetchLinks: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(endpoint + '/links'); // Passe den API-Endpunkt an
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
        try {
            const response = await fetch(endpoint + `/link/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
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
        try {
            const response = await fetch(`/api/linktree/links/${id}`, {
                method: 'DELETE',
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
        try {
            const response = await fetch(endpoint + '/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
}));

export default useLinkStore;

