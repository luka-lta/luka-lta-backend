export interface LinkItemType {
    id: number;
    displayname: string;
    description?: string;
    url: string;
    createdOn: string;
    isActive: boolean;
    iconName?: string;
    displayOrder: number;
}

export interface LinkTreeStore {
    links: LinkItemType[];
    isLoading: boolean;
    error: string | null;
    fetchLinks: () => Promise<void>;
    updateLink: (id: number, updatedData: Partial<LinkItemType>) => Promise<void>;
    deleteLink: (id: number) => Promise<void>;
    addLink: (newLink) => Promise<void>;
}