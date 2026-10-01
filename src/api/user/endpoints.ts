import api, {apiForm} from "@/api/axios.ts";
import {userListSchema} from "@/feature/user/schema/UserSchema.ts";

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
}

export async function fetchUserList(filterData: Record<string, string>) {
    const params = new URLSearchParams(filterData);

    for (const name of params.keys()) {
        if (params.get(name) === 'undefined') {
            params.delete(name);
        }
    }

    const response = await api.get(`/user/?${params.toString()}`);
    return userListSchema.parse(response.data.data);
}

export async function createUser(data: CreateUserInput): Promise<void> {
    await api.post('/user/', data);
}

export async function updateUser(userId: number, formData: FormData): Promise<void> {
    await apiForm.post(`/user/${userId}`, formData);
}

export async function deleteUser(userId: number): Promise<void> {
    await api.delete(`/user/${userId}`);
}
