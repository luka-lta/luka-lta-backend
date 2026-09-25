import axios, {AxiosError, InternalAxiosRequestConfig} from "axios";
import {useAuthenticatedUserStore} from "@/store/authStore.ts";

function attachAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const {jwt} = useAuthenticatedUserStore.getState();
    if (jwt) {
        config.headers.Authorization = jwt;
    }
    return config;
}

function handleAuthError(error: AxiosError) {
    const url = error.config?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/login");
    if (error.response?.status === 401 && !isAuthEndpoint) {
        useAuthenticatedUserStore.getState().logout();
        window.location.href = "/";
    }
    return Promise.reject(error);
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {"Content-Type": "application/json"},
});

api.interceptors.request.use((config) => {
    attachAuth(config);

    if (config.params) {
        const params = {...config.params};
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // Convert arrays to JSON strings for backend parsing
                params[key] = JSON.stringify(value);
            }
        });
        config.params = params;
    }

    return config;
});

api.interceptors.response.use((response) => response, handleAuthError);

// Separate instance for multipart/form-data uploads: no forced JSON content-type,
// so the browser can compute the multipart boundary itself.
export const apiForm = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

apiForm.interceptors.request.use(attachAuth);
apiForm.interceptors.response.use((response) => response, handleAuthError);

export default api;
