import { useMemo, useState } from "react";
import { CloudSun, MapPin, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import type { WeatherDetail } from "@/api/weather/schema.ts";
import { useWeatherDetail } from "@/api/weather/hooks.ts";
import { formatAbsFull, formatRel } from "@/lib/dateTimeUtils.ts";
import { cn } from "@/lib/utils.ts";
import { AirQuality } from "@/feature/weather/components/AirQuality.tsx";
import { Atmosphere } from "@/feature/weather/components/Atmosphere.tsx";
import { CurrentWeather } from "@/feature/weather/components/CurrentWeather.tsx";
import { DailyForecast } from "@/feature/weather/components/DailyForecast.tsx";
import { HourlyForecast } from "@/feature/weather/components/HourlyForecast.tsx";
import { LocationDialog } from "@/feature/weather/components/LocationDialog.tsx";
import { PrecipitationWarningBanner } from "@/feature/weather/components/PrecipitationWarningBanner.tsx";
import { SunInformation } from "@/feature/weather/components/SunInformation.tsx";
import { UVIndex } from "@/feature/weather/components/UVIndex.tsx";
import { WeatherSkeleton } from "@/feature/weather/components/WeatherSkeleton.tsx";
import { WindInformation } from "@/feature/weather/components/WindInformation.tsx";
import { findCurrentHour, findPrecipitationWarning } from "@/feature/weather/weatherData.ts";

function WeatherPage() {
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const detail = useWeatherDetail(true);
    const data = detail.data;
    const openLocationDialog = () => setLocationDialogOpen(true);

    return (
        <PageContainer title="Wetter">
            <PageHeader
                title={data?.location?.city ? `Wetter in ${data.location.city}` : "Wetter"}
                meta={data?.status === "stale" && (
                    <Badge variant="warning">Veraltet</Badge>
                )}
                description={<RefreshStatus data={data} isFetching={detail.isFetching} />}
                actions={
                    <>
                        <Button variant="outline" onClick={() => detail.refetch()} disabled={detail.isFetching}>
                            <RefreshCcw className={cn(detail.isFetching && "animate-spin")} />
                            Aktualisieren
                        </Button>
                        <Button variant="outline" onClick={openLocationDialog}>
                            <MapPin />
                            Standort
                        </Button>
                    </>
                }
            />

            <WeatherContent detail={detail} onConfigureLocation={openLocationDialog} />

            <LocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
        </PageContainer>
    );
}

function RefreshStatus({ data, isFetching }: { data: WeatherDetail | undefined; isFetching: boolean }) {
    const fetchedAt = data?.current?.fetchedAt;

    return (
        <span className="inline-flex items-center gap-2">
            <span
                className={cn(
                    "size-1.5 rounded-full transition-colors",
                    isFetching ? "animate-pulse bg-warning" : data?.status === "ok" ? "bg-success" : "bg-muted-foreground/50",
                )}
                aria-hidden
            />
            <span>
                Open-Meteo
                {isFetching && " · wird aktualisiert …"}
                {!isFetching && fetchedAt && (
                    <>
                        {" · "}
                        <Tooltip>
                            <TooltipTrigger className="underline decoration-dotted underline-offset-4">
                                aktualisiert {formatRel(fetchedAt)}
                            </TooltipTrigger>
                            <TooltipContent>{formatAbsFull(fetchedAt)}</TooltipContent>
                        </Tooltip>
                    </>
                )}
            </span>
        </span>
    );
}

interface WeatherContentProps {
    detail: ReturnType<typeof useWeatherDetail>;
    onConfigureLocation: () => void;
}

function WeatherContent({ detail, onConfigureLocation }: WeatherContentProps) {
    const data = detail.data;
    const warning = useMemo(() => (data ? findPrecipitationWarning(data.hourly) : null), [data]);

    if (detail.isError) {
        return <ErrorState title="Wetter konnte nicht geladen werden" error={detail.error} onRetry={() => detail.refetch()} />;
    }
    if (detail.isPending || data === undefined) return <WeatherSkeleton />;
    if (data.status === "not_configured") {
        return (
            <EmptyState
                icon={MapPin}
                title="Noch kein Standort"
                description="Lege fest, für welchen Ort Wetter und Regenwarnungen angezeigt werden."
                action={<Button variant="outline" size="sm" onClick={onConfigureLocation}>Standort festlegen</Button>}
            />
        );
    }
    if (!data.current) {
        return (
            <EmptyState
                icon={CloudSun}
                title="Wetterdaten werden abgerufen"
                description="Der erste Abruf kann einen Moment dauern."
                action={<Button variant="outline" size="sm" onClick={() => detail.refetch()}>Erneut prüfen</Button>}
            />
        );
    }

    const today = data.daily[0] ?? null;
    const tomorrow = data.daily[1] ?? null;
    const currentHour = findCurrentHour(data.hourly);

    return (
        <div className="space-y-4">
            <PrecipitationWarningBanner warning={warning} />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
                <div className="min-w-0 space-y-4">
                    <CurrentWeather current={data.current} today={today} />
                    <HourlyForecast hourly={data.hourly} daily={data.daily} />
                </div>
                <div className="min-w-0 space-y-4">
                    <DailyForecast daily={data.daily} hourly={data.hourly} currentTemperature={data.current.temperatureCelsius} />
                    <SunInformation today={today} tomorrow={tomorrow} />
                </div>
            </div>

            <section aria-label="Weitere Wetterdaten" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <WindInformation current={data.current} today={today} />
                <UVIndex current={data.current.uvIndex} todayMax={today?.uvIndexMax ?? null} />
                <AirQuality airQuality={data.airQuality ?? null} />
                <Atmosphere current={data.current} currentHour={currentHour} />
            </section>
        </div>
    );
}

export default WeatherPage;
