import api, {apiForm} from "@/api/axios.ts";
import {selfUserListSchema} from "@/feature/SelfOverview/schema/SelfUserSchema.tsx";

export async function fetchSelfUser() {
    const response = await api.get(`/self/`);
    return selfUserListSchema.parse(response.data.data);
}

export async function updateSelfUser(formData: FormData): Promise<void> {
    await apiForm.post(`/self/`, formData);
}

export async function updateSelfPassword(password: string): Promise<void> {
    await api.put("/auth/update-password", {password});
}
