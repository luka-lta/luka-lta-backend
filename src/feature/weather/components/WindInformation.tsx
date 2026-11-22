import { Wind } from "lucide-react";
import type { WeatherForecastDay, WeatherReading } from "@/api/weather/schema.ts";
import { InfoCard } from "@/feature/weather/components/InfoCard.tsx";
import { Metric, MetricList } from "@/feature/weather/components/WeatherMetric.tsx";
import { formatNumber, formatWindDirection } from "@/feature/weather/weatherData.ts";

/** Compass tick marks every 30°. */
const COMPASS_TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

const CARDINALS = [
    { label: "N", x: 50, y: 13 },
    { label: "O", x: 88, y: 53 },
    { label: "S", x: 50, y: 92 },
    { label: "W", x: 12, y: 53 },
];

interface WindInformationProps {
    current: WeatherReading;
    today: WeatherForecastDay | null;
}

export function WindInformation({ current, today }: WindInformationProps) {
    const direction = current.windDirectionDegrees;

    return (
        <InfoCard icon={Wind} title="Wind">
            <div className="flex items-center gap-5">
                <svg viewBox="0 0 100 100" className="size-24 shrink-0" role="img" aria-label={`Wind aus ${formatWindDirection(direction)}`}>
                    <circle cx="50" cy="50" r="44" className="fill-none stroke-border" strokeWidth="1" />
                    {COMPASS_TICKS.map((deg) => (
                        <line
                            key={deg}
                            x1="50" y1="7" x2="50" y2={deg % 90 === 0 ? 12 : 10}
                            className="stroke-muted-foreground/50"
                            strokeWidth="1"
                            transform={`rotate(${deg} 50 50)`}
                        />
                    ))}
                    {CARDINALS.map((c) => (
                        <text key={c.label} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[9px] font-medium">
                            {c.label}
                        </text>
                    ))}
                    {/* Arrow points downwind: it starts at the side the wind comes from. */}
                    <g transform={`rotate(${direction} 50 50)`}>
                        <line x1="50" y1="22" x2="50" y2="74" className="stroke-warning" strokeWidth="2" strokeLinecap="round" />
                        <path d="M50 80 L44.5 70 L55.5 70 Z" className="fill-warning" />
                        <circle cx="50" cy="22" r="2.5" className="fill-warning" />
                    </g>
                </svg>
                <div className="min-w-0">
                    <p className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-semibold tabular-nums tracking-tight">{formatNumber(current.windSpeedKmh)}</span>
                        <span className="text-sm text-muted-foreground">km/h</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        aus {formatWindDirection(direction)} · <span className="tabular-nums">{formatNumber(direction)}°</span>
                    </p>
                </div>
            </div>
            <MetricList className="mt-auto grid-cols-2 pt-5">
                <Metric label="Böen" value={`${formatNumber(current.windGustsKmh)} km/h`} />
                {today?.windSpeedMaxKmh != null && (
                    <Metric
                        label="Heute max."
                        value={`${formatNumber(today.windSpeedMaxKmh)} km/h`}
                        hint={today.windGustsMaxKmh != null ? `Böen ${formatNumber(today.windGustsMaxKmh)} km/h` : undefined}
                    />
                )}
            </MetricList>
        </InfoCard>
    );
}
