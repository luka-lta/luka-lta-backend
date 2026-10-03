import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { CloudOff, Droplets, MapPin, Wind } from "lucide-react";
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
                <CardTitle className="text-base flex items-center gap-2">
                    {data?.location && <MapPin className="h-4 w-4 text-muted-foreground" />}
                    Wetter{data?.location ? ` · ${data.location.city}` : ""}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onOpenDetail} disabled={!data?.current}>
                    Details
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
                    <Empty className="border-0 py-6">
                        <EmptyMedia variant="icon">
                            <CloudOff className="text-amber-500" />
                        </EmptyMedia>
                        <EmptyTitle>Wetter momentan nicht erreichbar</EmptyTitle>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                            Erneut versuchen
                        </Button>
                    </Empty>
                )}

                {!isPending && !isError && data?.status === "not_configured" && (
                    <Empty className="border-0 py-6">
                        <EmptyMedia variant="icon">
                            <CloudOff />
                        </EmptyMedia>
                        <EmptyTitle>Kein Standort konfiguriert</EmptyTitle>
                        <EmptyDescription>Der Standort kann in den Einstellungen festgelegt werden.</EmptyDescription>
                    </Empty>
                )}

                {!isPending && !isError && data?.status !== "not_configured" && data?.current === null && (
                    <p className="text-sm text-muted-foreground py-6 text-center">Wetterdaten werden geladen…</p>
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
                <Icon className="h-10 w-10 text-amber-500 shrink-0" />
                <div>
                    <p className="text-3xl font-bold tabular-nums leading-none">{Math.round(current.temperatureCelsius)}°C</p>
                    <p className="text-sm text-muted-foreground">Gefühlt {Math.round(current.apparentTemperatureCelsius)}°C</p>
                </div>
            </div>

            <p className="text-sm font-medium">{current.condition}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5" />
                    {current.humidityPercent}%
                </span>
                <span className="flex items-center gap-1">
                    <Wind className="h-3.5 w-3.5" />
                    {Math.round(current.windSpeedKmh)} km/h
                </span>
            </div>
        </div>
    );
}
