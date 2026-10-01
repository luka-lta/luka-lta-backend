import api from "@/api/axios.ts";
import {clickResponse} from "@/feature/clicks/schema/clickSchema.ts";

export async function fetchClicksOverview(filterData: Record<string, string>) {
    const params = new URLSearchParams(filterData);

    for (const name of params.keys()) {
        if (params.get(name) === 'undefined') {
            params.delete(name);
        }
    }

    const response = await api.get(`/click/?${params.toString()}`);
    return clickResponse.parse(response.data.data);
}
