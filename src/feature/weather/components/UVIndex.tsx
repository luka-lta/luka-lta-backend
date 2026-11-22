import { Sun } from "lucide-react";
import { InfoCard } from "@/feature/weather/components/InfoCard.tsx";
import { LevelScale } from "@/feature/weather/components/LevelScale.tsx";
import { formatNumber, levelIndex, UV_LEVELS } from "@/feature/weather/weatherData.ts";

/** WHO recommendation per UV band, same order as UV_LEVELS. */
const UV_ADVICE = [
    "Kein Sonnenschutz nötig.",
    "Mittags Schatten suchen, Sonnenschutz empfohlen.",
    "Sonnenschutz nötig, Mittagssonne meiden.",
    "Mittags möglichst drinnen bleiben.",
    "Aufenthalt im Freien vermeiden.",
];

interface UVIndexProps {
    current: number | null;
    todayMax: number | null;
}

export function UVIndex({ current, todayMax }: UVIndexProps) {
    const value = current ?? todayMax;
    if (value === null) return null;

    const index = levelIndex(UV_LEVELS, value);

    return (
        <InfoCard icon={Sun} title="UV-Index" aside={current === null ? "Tagesmaximum" : undefined}>
            <p className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums tracking-tight">{formatNumber(value, 1)}</span>
                <span className="text-sm font-medium text-warning">{UV_LEVELS[index].label}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{UV_ADVICE[index]}</p>
            <div className="mt-auto pt-5">
                <LevelScale levels={UV_LEVELS} activeIndex={index} label="UV-Belastung" />
                {current !== null && todayMax !== null && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        Heute bis <span className="tabular-nums text-foreground">{formatNumber(todayMax, 1)}</span>
                    </p>
                )}
            </div>
        </InfoCard>
    );
}
