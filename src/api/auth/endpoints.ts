import api from "@/api/axios.ts";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";

export interface LoginResponse {
    token: string;
    user: UserTypeSchema;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', {email, password});

    return response.data.data;
}
