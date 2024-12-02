import {LinkItemTypeSchema} from "@/lib/LinkTypes.ts";

export interface LinkTreeStore {
    links: LinkItemTypeSchema[];
    isLoading: boolean;
    error: string | null;
    fetchLinks: () => Promise<void>;
    updateLink: (id: number, updatedData: Partial<LinkItemTypeSchema>) => Promise<void>;
    deleteLink: (id: number) => Promise<void>;
    addLink: (newLink) => Promise<void>;
}