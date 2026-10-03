import api from "@/api/axios.ts";
import {
    weatherDetailSchema,
    weatherLocationResultSchema,
    weatherSummarySchema,
} from "@/api/weather/schema.ts";

export async function fetchWeatherSummary() {
    const response = await api.get("/weather");
    return weatherSummarySchema.parse(response.data.data);
}

export async function fetchWeatherDetail() {
    const response = await api.get("/weather/detail");
    return weatherDetailSchema.parse(response.data.data);
}

export async function fetchWeatherLocation() {
    const response = await api.get("/weather/location");
    return weatherLocationResultSchema.parse(response.data.data).location;
}

export async function updateWeatherLocation(data: { city: string; latitude: number; longitude: number }) {
    const response = await api.patch("/weather/location", data);
    return weatherLocationResultSchema.parse(response.data.data).location;
}
