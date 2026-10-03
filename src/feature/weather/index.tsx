import { useMemo, useState } from "react";
import { Main } from "@/components/layout/main.tsx";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";
import { ErrorState } from "@/components/error-state.tsx";
import { RefreshButton } from "@/components/refresh-button.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { MapPin, Settings } from "lucide-react";
import { useWeatherDetail } from "@/api/weather/hooks.ts";
import { formatRel } from "@/lib/dateTimeUtils.ts";
import { CurrentConditionsCard } from "@/feature/weather/components/CurrentConditionsCard.tsx";
import { HourlyForecastCard } from "@/feature/weather/components/HourlyForecastCard.tsx";
import { SevenDayForecastCard } from "@/feature/weather/components/SevenDayForecastCard.tsx";
import { PrecipitationWarningBanner } from "@/feature/weather/components/PrecipitationWarningBanner.tsx";
import { LocationDialog } from "@/feature/weather/components/LocationDialog.tsx";
import { findPrecipitationWarning } from "@/feature/weather/weatherData.ts";

function WeatherPage() {
    useSetPageTitle("Backend - Weather");

    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const detail = useWeatherDetail(true);
    const data = detail.data;

    const warning = useMemo(
        () => (data ? findPrecipitationWarning(data.hourly) : null),
        [data],
    );

    if (detail.isError) {
        return (
            <Main>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Wetter</h2>
                <ErrorState title="Wetter konnte nicht geladen werden" message={detail.error.message} refetch={detail.refetch} />
            </Main>
        );
    }

    return (
        <Main>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Wetter</h2>
                    <p className="text-muted-foreground text-sm">
                        Open-Meteo
                        {data?.current && <> · Aktualisiert {formatRel(data.current.fetchedAt)}</>}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <RefreshButton variant="outline" onRefresh={async () => { await detail.refetch(); }} />
                    <Button variant="outline" onClick={() => setLocationDialogOpen(true)}>
                        <MapPin className="h-4 w-4" />
                        {data?.location?.city ?? "Standort"}
                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {detail.isPending && (
                <div className="space-y-4">
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            )}

            {!detail.isPending && data?.status === "not_configured" && (
                <div className="rounded-lg border py-16 text-center">
                    <p className="text-muted-foreground mb-3">Kein Standort konfiguriert.</p>
                    <Button onClick={() => setLocationDialogOpen(true)}>Standort festlegen</Button>
                </div>
            )}

            {!detail.isPending && data?.status !== "not_configured" && data?.current === null && (
                <p className="text-sm text-muted-foreground py-16 text-center">Wetterdaten werden geladen…</p>
            )}

            {!detail.isPending && data?.current && (
                <div className="space-y-4">
                    <PrecipitationWarningBanner warning={warning} />
                    <CurrentConditionsCard current={data.current} />
                    <HourlyForecastCard hourly={data.hourly} />
                    <SevenDayForecastCard daily={data.daily} />
                </div>
            )}

            <LocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} />
        </Main>
    );
}

export default WeatherPage;
