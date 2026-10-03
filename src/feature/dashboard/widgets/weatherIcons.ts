import {
    Cloud,
    CloudDrizzle,
    CloudFog,
    CloudLightning,
    CloudMoon,
    CloudRain,
    CloudSnow,
    CloudSun,
    HelpCircle,
    type LucideIcon,
    Moon,
    Sun,
} from "lucide-react";

const WEATHER_ICON_MAP: Record<string, LucideIcon> = {
    "clear-day": Sun,
    "clear-night": Moon,
    "partly-cloudy-day": CloudSun,
    "partly-cloudy-night": CloudMoon,
    cloudy: Cloud,
    fog: CloudFog,
    drizzle: CloudDrizzle,
    rain: CloudRain,
    snow: CloudSnow,
    thunderstorm: CloudLightning,
    unknown: HelpCircle,
};

export function getWeatherIcon(icon: string): LucideIcon {
    return WEATHER_ICON_MAP[icon] ?? HelpCircle;
}
