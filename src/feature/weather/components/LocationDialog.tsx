import { type FormEvent, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
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
                    toast.success("Standort aktualisiert.");
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Standort</DialogTitle>
                    <DialogDescription>Bestimmt, für welchen Ort die Wetterdaten geladen werden.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="weather-city">Stadt</Label>
                        <Input id="weather-city" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="weather-lat">Breitengrad</Label>
                            <Input
                                id="weather-lat"
                                type="number"
                                step="0.00001"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="weather-lon">Längengrad</Label>
                            <Input
                                id="weather-lon"
                                type="number"
                                step="0.00001"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={updateLocation.isPending}>
                            Speichern
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
