import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";
import {create} from "zustand";
import {ApiKeyTypeSchema} from "@/shemas/ApiKeySchema.ts";

const endpoint = 'https://api.luka-lta.dev/api/v1';

interface ApiKeyStore {
    apiKeys: ApiKeyTypeSchema[];
    isLoading: boolean;
    error: string | null;
    fetchApiKeys: () => Promise<void>;
    triggerFetch: () => void;
}

export const useApiKeyStore = create<ApiKeyStore>((set) => ({
    apiKeys: [],
    isLoading: false,
    error: null,

    fetchApiKeys: async () => {
        set({ isLoading: true, error: null });
        const { jwt } = useAuthenticatedUserStore.getState();
        try {
            const response = await fetch(endpoint + '/key/', {
                headers: {
                    Authorization: `${jwt}`,
                },
            }); // Passe den API-Endpunkt an
            if (!response.ok) throw new Error('Failed to load ApiKeys');
            const data = await response.json();
            const keys: ApiKeyTypeSchema[] = data.apiKeys;
            set({ apiKeys: keys, isLoading: false });
        } catch (error: unknown) {
            if (error instanceof Error) {
                set({ error: error.message, isLoading: false });
            }
        }
    },
    triggerFetch: () => {
        const fetchApiKeys = useApiKeyStore.getState().fetchApiKeys;
        fetchApiKeys();
    },
}));

export default useApiKeyStore;
