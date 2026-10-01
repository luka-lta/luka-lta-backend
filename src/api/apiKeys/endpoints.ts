import api from "@/api/axios.ts";
import { apiKeyCreatedSchema, apiKeyListSchema, permissionListSchema } from "@/api/apiKeys/schema.ts";

export interface CreateApiKeyInput {
    label: string;
    origin: string;
    permissionIds: number[];
    expiresAt?: string;
}

export async function fetchApiKeys() {
    const response = await api.get("/api-keys/");
    return apiKeyListSchema.parse(response.data.data).apiKeys;
}

export async function fetchPermissions() {
    const response = await api.get("/permissions/");
    return permissionListSchema.parse(response.data.data).permissions;
}

export async function createApiKey(data: CreateApiKeyInput) {
    const response = await api.post("/api-keys/", data);
    return apiKeyCreatedSchema.parse(response.data.data);
}

export async function deleteApiKey(keyId: number): Promise<void> {
    await api.delete(`/api-keys/${keyId}`);
}
