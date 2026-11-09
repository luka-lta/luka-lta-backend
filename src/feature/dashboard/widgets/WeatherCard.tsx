import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ChevronRight, CloudOff, Droplets, MapPin, Wind } from "lucide-react";
import { useWeatherSummary } from "@/api/weather/hooks.ts";
import { getWeatherIcon } from "@/feature/dashboard/widgets/weatherIcons.ts";

interface WeatherCardProps {
    onOpenDetail: () => void;
}

export function WeatherCard({ onOpenDetail }: WeatherCardProps) {
    const { data, isPending, isError, refetch } = useWeatherSummary();

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" aria-hidden />
                    {data?.location ? data.location.city : "Wetter"}
                </CardTitle>
                <Button variant="ghost" size="sm" className="-mr-2 text-muted-foreground" onClick={onOpenDetail}>
                    Vorhersage
                    <ChevronRight />
                </Button>
            </CardHeader>
            <CardContent>
                {isPending && (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                )}

                {isError && !isPending && (
                    <EmptyState
                        variant="plain"
                        className="py-6"
                        icon={CloudOff}
                        title="Wetter gerade nicht erreichbar"
                        action={<Button variant="outline" size="sm" onClick={() => refetch()}>Erneut versuchen</Button>}
                    />
                )}

                {!isPending && !isError && data?.status === "not_configured" && (
                    <EmptyState
                        variant="plain"
                        className="py-6"
                        icon={CloudOff}
                        title="Kein Standort hinterlegt"
                        description="Lege auf der Wetter-Seite fest, für welchen Ort Daten geladen werden."
                        action={<Button variant="outline" size="sm" onClick={onOpenDetail}>Standort festlegen</Button>}
                    />
                )}

                {!isPending && !isError && data?.status !== "not_configured" && data?.current === null && (
                    <p className="py-6 text-center text-sm text-muted-foreground">Wetterdaten werden abgerufen…</p>
                )}

                {!isPending && !isError && data?.current && (
                    <WeatherCardBody current={data.current} />
                )}
            </CardContent>
        </Card>
    );
}

function WeatherCardBody({ current }: { current: NonNullable<NonNullable<ReturnType<typeof useWeatherSummary>["data"]>["current"]> }) {
    const Icon = getWeatherIcon(current.icon);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Icon className="size-10 shrink-0 text-warning" aria-hidden />
                <div>
                    <p className="text-3xl font-semibold tabular-nums leading-none">{Math.round(current.temperatureCelsius)} °C</p>
                    <p className="text-sm text-muted-foreground">gefühlt {Math.round(current.apparentTemperatureCelsius)} °C</p>
                </div>
            </div>

            <p className="text-sm font-medium">{current.condition}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Droplets className="size-3.5" aria-hidden />
                    <span className="sr-only">Luftfeuchte</span>
                    {current.humidityPercent} %
                </span>
                <span className="flex items-center gap-1">
                    <Wind className="size-3.5" aria-hidden />
                    <span className="sr-only">Wind</span>
                    {Math.round(current.windSpeedKmh)} km/h
                </span>
            </div>
        </div>
    );
}
