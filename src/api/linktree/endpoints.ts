import api from "@/api/axios.ts";
import {linkDetailSchema} from "@/feature/linktree/childPages/detail/schema/LinkDetailSchema.ts";
import {linkListSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";

export interface LinkInput {
    displayname: string;
    description?: string | null;
    url: string;
    isActive: boolean;
    iconName?: string | null;
}

export interface LinkEditInput {
    displayname: string;
    url: string;
    isActive: boolean;
}

export async function fetchLinktreeList(filterData: Record<string, string>) {
    const params = new URLSearchParams(filterData);

    for (const name of params.keys()) {
        if (params.get(name) === 'undefined') {
            params.delete(name);
        }
    }

    const response = await api.get(`/linkCollection/?${params.toString()}`);
    return linkListSchema.parse(response.data.data);
}

export async function fetchLinkDetail(linkId: number, filterData: Record<string, string> = {}) {
    const params = new URLSearchParams(filterData);

    for (const name of params.keys()) {
        if (params.get(name) === 'undefined') {
            params.delete(name);
        }
    }

    const response = await api.get(`/linkCollection/${linkId}?${params.toString()}`);
    return linkDetailSchema.parse(response.data.data);
}

export async function createLink(data: LinkInput): Promise<void> {
    await api.post('/linkCollection/', data);
}

export async function updateLink(linkId: number, data: LinkInput | LinkEditInput): Promise<void> {
    await api.put(`/linkCollection/${linkId}`, data);
}

export async function deactivateLink(linkId: number): Promise<void> {
    await api.put(`/linkCollection/deactivate/${linkId}`);
}

export async function activateLink(linkId: number): Promise<void> {
    await api.put(`/linkCollection/activate/${linkId}`);
}

export async function deleteLink(linkId: number): Promise<void> {
    await api.delete(`/linkCollection/${linkId}`);
}
