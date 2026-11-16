import { type FormEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { toast } from "sonner";
import { useUpdateWeatherLocation, useWeatherLocation } from "@/api/weather/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface LocationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LocationDialog({ open, onOpenChange }: LocationDialogProps) {
    const locationQuery = useWeatherLocation();
    const updateLocation = useUpdateWeatherLocation();

    const [city, setCity] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    useEffect(() => {
        if (locationQuery.data) {
            setCity(locationQuery.data.city);
            setLatitude(String(locationQuery.data.latitude));
            setLongitude(String(locationQuery.data.longitude));
        }
    }, [locationQuery.data]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        updateLocation.mutate(
            { city, latitude: Number(latitude), longitude: Number(longitude) },
            {
                onSuccess: () => {
                    toast.success("Standort gespeichert");
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    const latValid = latitude !== "" && Number.isFinite(Number(latitude)) && Math.abs(Number(latitude)) <= 90;
    const lonValid = longitude !== "" && Number.isFinite(Number(longitude)) && Math.abs(Number(longitude)) <= 180;

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            title="Standort"
            description="Für diesen Ort werden die Wetterdaten abgerufen."
            onSubmit={handleSubmit}
            submitLabel="Speichern"
            isSubmitting={updateLocation.isPending}
            submitDisabled={!city.trim() || !latValid || !lonValid}
        >
            <div className="space-y-2">
                <Label htmlFor="weather-city">Stadt</Label>
                <Input id="weather-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="z. B. Berlin" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="weather-lat">Breitengrad</Label>
                    <Input
                        id="weather-lat"
                        type="number"
                        inputMode="decimal"
                        step="0.00001"
                        className="tabular-nums"
                        aria-invalid={latitude !== "" && !latValid}
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="weather-lon">Längengrad</Label>
                    <Input
                        id="weather-lon"
                        type="number"
                        inputMode="decimal"
                        step="0.00001"
                        className="tabular-nums"
                        aria-invalid={longitude !== "" && !lonValid}
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                    />
                </div>
            </div>
            <p className="text-xs text-muted-foreground">Koordinaten findest du z. B. per Rechtsklick in einer Kartenanwendung.</p>
        </FormDialog>
    );
}
