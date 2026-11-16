import { useMemo, useState } from "react";
import { CloudSun, MapPin, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { useWeatherDetail } from "@/api/weather/hooks.ts";
import { formatRel } from "@/lib/dateTimeUtils.ts";
import { cn } from "@/lib/utils.ts";
import { CurrentConditionsCard } from "@/feature/weather/components/CurrentConditionsCard.tsx";
import { HourlyForecastCard } from "@/feature/weather/components/HourlyForecastCard.tsx";
import { SevenDayForecastCard } from "@/feature/weather/components/SevenDayForecastCard.tsx";
import { PrecipitationWarningBanner } from "@/feature/weather/components/PrecipitationWarningBanner.tsx";
import { LocationDialog } from "@/feature/weather/components/LocationDialog.tsx";
import { findPrecipitationWarning } from "@/feature/weather/weatherData.ts";

function WeatherPage() {
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const detail = useWeatherDetail(true);
    const data = detail.data;
    const warning = useMemo(() => (data ? findPrecipitationWarning(data.hourly) : null), [data]);

    return (
        <PageContainer title="Wetter">
            <PageHeader
                title={data?.location?.city ? `Wetter in ${data.location.city}` : "Wetter"}
                description={
                    <>
                        Daten von Open-Meteo
                        {data?.current && <> · aktualisiert {formatRel(data.current.fetchedAt)}</>}
                    </>
                }
                actions={
                    <>
                        <Button variant="outline" onClick={() => detail.refetch()} disabled={detail.isFetching}>
                            <RefreshCcw className={cn(detail.isFetching && "animate-spin")} />
                            Aktualisieren
                        </Button>
                        <Button variant="outline" onClick={() => setLocationDialogOpen(true)}>
                            <MapPin />
                            Standort
                        </Button>
                    </>
                }
            />

            {detail.isError ? (
                <ErrorState title="Wetter konnte nicht geladen werden" error={detail.error} onRetry={() => detail.refetch()} />
            ) : detail.isPending ? (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]" aria-busy="true" aria-label="Wird geladen">
                    <div className="space-y-4">
                        <Skeleton className="h-36 rounded-xl" />
                        <Skeleton className="h-44 rounded-xl" />
                    </div>
                    <Skeleton className="h-96 rounded-xl" />
                </div>
            ) : data?.status === "not_configured" ? (
                <EmptyState
                    icon={MapPin}
                    title="Noch kein Standort"
                    description="Lege fest, für welchen Ort Wetter und Regenwarnungen angezeigt werden."
                    action={<Button variant="outline" size="sm" onClick={() => setLocationDialogOpen(true)}>Standort festlegen</Button>}
                />
            ) : !data?.current ? (
                <EmptyState
                    icon={CloudSun}
                    title="Wetterdaten werden abgerufen"
                    description="Der erste Abruf kann einen Moment dauern."
                    action={<Button variant="outline" size="sm" onClick={() => detail.refetch()}>Erneut prüfen</Button>}
                />
            ) : (
                <div className="space-y-4">
                    <PrecipitationWarningBanner warning={warning} />
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                        <div className="min-w-0 space-y-4">
                            <CurrentConditionsCard current={data.current} />
                            <HourlyForecastCard hourly={data.hourly} />
                        </div>
                        <SevenDayForecastCard daily={data.daily} />
                    </div>
                </div>
            )}

            <LocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
        </PageContainer>
    );
}

export default WeatherPage;
