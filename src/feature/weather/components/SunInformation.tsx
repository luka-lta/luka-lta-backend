import type { DateTime } from "luxon";
import { Sunrise, Sunset, SunMedium } from "lucide-react";
import type { WeatherForecastDay } from "@/api/weather/schema.ts";
import { InfoCard } from "@/feature/weather/components/InfoCard.tsx";
import { Metric, MetricList } from "@/feature/weather/components/WeatherMetric.tsx";
import { useNow } from "@/feature/weather/useNow.ts";
import { formatDaylightDuration, formatNumber, sunTimes } from "@/feature/weather/weatherData.ts";

/** Geometry of the sun arc in SVG units: a half circle on a horizon line. */
const ARC = { cx: 120, cy: 104, r: 92 };

interface SunInformationProps {
    today: WeatherForecastDay | null;
    tomorrow: WeatherForecastDay | null;
}

export function SunInformation({ today, tomorrow }: SunInformationProps) {
    const now = useNow();
    const sun = today ? sunTimes(today) : null;
    if (!today || !sun) return null;

    const isDaylight = now >= sun.sunrise && now <= sun.sunset;
    const progress = isDaylight
        ? now.diff(sun.sunrise).as("milliseconds") / sun.sunset.diff(sun.sunrise).as("milliseconds")
        : null;
    const nextSunrise = now < sun.sunrise ? sun.sunrise : (tomorrow ? sunTimes(tomorrow)?.sunrise ?? null : null);

    return (
        <InfoCard icon={SunMedium} title="Sonne" aside={formatDaylightDuration(today.sunrise, today.sunset) + " Tageslicht"}>
            <div className="space-y-5">
                <SunArc progress={progress} />
                <div className="space-y-5">
                    <p className="text-sm">
                        {progress !== null
                            ? <DaylightLeft sunset={sun.sunset} now={now} progress={progress} />
                            : <NightStatus nextSunrise={nextSunrise} now={now} />}
                    </p>
                    <MetricList className="grid-cols-2">
                        <Metric icon={Sunrise} label="Sonnenaufgang" value={sun.sunrise.toFormat("HH:mm")} />
                        <Metric icon={Sunset} label="Sonnenuntergang" value={sun.sunset.toFormat("HH:mm")} />
                    </MetricList>
                </div>
            </div>
        </InfoCard>
    );
}

function DaylightLeft({ sunset, now, progress }: { sunset: DateTime; now: DateTime; progress: number }) {
    const left = sunset.diff(now, ["hours", "minutes"]).toObject();
    return (
        <>
            <span className="font-medium tabular-nums">
                Noch {Math.floor(left.hours ?? 0)} h {Math.floor(left.minutes ?? 0)} min Tageslicht
            </span>
            <span className="block text-muted-foreground tabular-nums">{formatNumber(progress * 100)} % des Tages vergangen</span>
        </>
    );
}

function NightStatus({ nextSunrise, now }: { nextSunrise: DateTime | null; now: DateTime }) {
    if (!nextSunrise) return <span className="text-muted-foreground">Die Sonne ist untergegangen.</span>;
    const until = nextSunrise.diff(now, ["hours", "minutes"]).toObject();
    return (
        <>
            <span className="font-medium tabular-nums">
                Sonnenaufgang in {Math.floor(until.hours ?? 0)} h {Math.floor(until.minutes ?? 0)} min
            </span>
            <span className="block text-muted-foreground tabular-nums">um {nextSunrise.toFormat("HH:mm")} Uhr</span>
        </>
    );
}

/** Half-circle day arc; the traveled part is drawn in the accent color, the sun sits at the current position. */
function SunArc({ progress }: { progress: number | null }) {
    const { cx, cy, r } = ARC;
    const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
    const angle = Math.PI * (1 - (progress ?? 0));
    const sunX = cx + r * Math.cos(angle);
    const sunY = cy - r * Math.sin(angle);

    return (
        <svg viewBox="0 0 240 116" className="mx-auto w-full max-w-64" role="img" aria-label={progress !== null ? `Tagesfortschritt ${formatNumber(progress * 100)} Prozent` : "Nacht"}>
            <line x1="8" y1={cy} x2="232" y2={cy} className="stroke-border" strokeWidth="1" />
            <path d={arcPath} className="fill-none stroke-border" strokeWidth="1.5" strokeDasharray="3 5" />
            {progress !== null && (
                <>
                    <path
                        d={arcPath}
                        pathLength={1}
                        strokeDasharray={`${progress} 1`}
                        className="fill-none stroke-warning"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <circle cx={sunX} cy={sunY} r="9" className="fill-warning/15" />
                    <circle cx={sunX} cy={sunY} r="5" className="fill-warning" />
                </>
            )}
        </svg>
    );
}
