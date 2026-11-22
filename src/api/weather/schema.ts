import { z } from "zod";

export const WeatherLocationSchema = z.object({
    city: z.string(),
    latitude: z.number(),
    longitude: z.number(),
});

export const WeatherReadingSchema = z.object({
    temperatureCelsius: z.number(),
    apparentTemperatureCelsius: z.number(),
    condition: z.string(),
    icon: z.string(),
    humidityPercent: z.number(),
    precipitationMm: z.number(),
    cloudCoverPercent: z.number(),
    pressureMslHpa: z.number(),
    windSpeedKmh: z.number(),
    windDirectionDegrees: z.number(),
    windGustsKmh: z.number(),
    uvIndex: z.number().nullable(),
    isDay: z.boolean(),
    fetchedAt: z.string(),
});

// Optionale Felder sind `nullish`: ältere API-Stände bzw. Forecast-Caches liefern sie
// nicht, und die UI blendet fehlende Werte aus, statt sie zu erfinden.
export const WeatherHourPointSchema = z.object({
    time: z.string(),
    temperatureCelsius: z.number(),
    precipitationProbabilityPercent: z.number(),
    precipitationMm: z.number(),
    condition: z.string(),
    icon: z.string(),
    isDay: z.boolean().nullish(),
    humidityPercent: z.number().nullish(),
    dewPointCelsius: z.number().nullish(),
    windSpeedKmh: z.number().nullish(),
    windDirectionDegrees: z.number().nullish(),
    windGustsKmh: z.number().nullish(),
    visibilityMeters: z.number().nullish(),
    cloudCoverPercent: z.number().nullish(),
    uvIndex: z.number().nullish(),
});

export const WeatherForecastDaySchema = z.object({
    date: z.string(),
    temperatureMinCelsius: z.number(),
    temperatureMaxCelsius: z.number(),
    condition: z.string(),
    icon: z.string(),
    precipitationSumMm: z.number(),
    precipitationProbabilityPercent: z.number(),
    uvIndexMax: z.number().nullable(),
    sunrise: z.string(),
    sunset: z.string(),
    windSpeedMaxKmh: z.number().nullish(),
    windGustsMaxKmh: z.number().nullish(),
    windDirectionDominantDegrees: z.number().nullish(),
});

export const WeatherAirQualitySchema = z.object({
    europeanAqi: z.number().nullable(),
    pm25: z.number().nullable(),
    pm10: z.number().nullable(),
    measuredAt: z.string(),
});

export const weatherStatusSchema = z.enum(["ok", "stale", "pending", "not_configured"]);

export const weatherSummarySchema = z.object({
    status: weatherStatusSchema,
    location: WeatherLocationSchema.nullable(),
    current: WeatherReadingSchema.nullable(),
});

export const weatherDetailSchema = z.object({
    status: weatherStatusSchema,
    location: WeatherLocationSchema.nullable(),
    current: WeatherReadingSchema.nullable(),
    hourly: z.array(WeatherHourPointSchema),
    daily: z.array(WeatherForecastDaySchema),
    airQuality: WeatherAirQualitySchema.nullish(),
});

export const weatherLocationResultSchema = z.object({
    location: WeatherLocationSchema.nullable(),
});

export type WeatherLocation = z.infer<typeof WeatherLocationSchema>;
export type WeatherReading = z.infer<typeof WeatherReadingSchema>;
export type WeatherHourPoint = z.infer<typeof WeatherHourPointSchema>;
export type WeatherForecastDay = z.infer<typeof WeatherForecastDaySchema>;
export type WeatherAirQuality = z.infer<typeof WeatherAirQualitySchema>;
export type WeatherStatus = z.infer<typeof weatherStatusSchema>;
export type WeatherSummary = z.infer<typeof weatherSummarySchema>;
export type WeatherDetail = z.infer<typeof weatherDetailSchema>;
