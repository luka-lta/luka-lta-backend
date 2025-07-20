import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";
import {ApiResponseSchema, ApiSchema} from "@/lib/ApiSchema.ts";
import axios from "axios";

export class FetchWrapper {
    private readonly baseUrl: string;
    static baseUrl: string;
    static routes: Record<string, string>;

    static {
        this.baseUrl = import.meta.env.VITE_API_URL;
        this.routes = {
            login: import.meta.env.VITE_API_LOGIN_ROUTE,
        };
    }

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request(
        endpoint: string,
        method: string,
        body?: unknown,
        headers: Record<string, string> = {}
    ): Promise<ApiSchema> {
        const {jwt} = useAuthenticatedUserStore.getState();

        const config: RequestInit = {
            method,
            headers: {
                'Authorization': jwt ?? '',
                'Content-Type': 'application/json',
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        };

        // @ts-ignore
        const response = await axios({
            url: `${this.baseUrl}${endpoint}`,
            method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
            headers: config.headers,
            data: config.body,
        })

        const data = response.data;

        return ApiResponseSchema.parse(data);

    }

    public async formDataRequest(
        endpoint: string,
        body: FormData,
    ): Promise<ApiSchema> {
        const {jwt} = useAuthenticatedUserStore.getState();
        const headers: HeadersInit = {
            'Authorization': jwt ?? '',

        }

        const config: RequestInit = {
            'method': 'POST',
            headers: headers,
            body: body,
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message ?? 'An unexpected error occurred');
            }

            return ApiResponseSchema.parse(data);
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    get(endpoint: string, headers?: HeadersInit): Promise<ApiSchema> {
        return this.request(endpoint, 'GET', undefined, headers);
    }

    post(endpoint: string, body?: unknown, headers?: HeadersInit): Promise<ApiSchema> {
        return this.request(endpoint, 'POST', body, headers);
    }

    put(endpoint: string, body: unknown, headers?: HeadersInit): Promise<ApiSchema> {
        return this.request(endpoint, 'PUT', body, headers);
    }

    delete(endpoint: string, headers?: HeadersInit): Promise<ApiSchema> {
        return this.request(endpoint, 'DELETE', undefined, headers);
    }
}
