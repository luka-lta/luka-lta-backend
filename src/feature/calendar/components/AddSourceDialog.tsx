import { type FormEvent, useState } from "react";
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
import { Spinner } from "@/components/ui/kibo-ui/spinner/index.tsx";
import { toast } from "sonner";
import { useCalendarSources, useCreateCalendarSource } from "@/api/calendar/hooks.ts";
import { pickNextCalendarColor } from "@/feature/calendar/calendarColors.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface AddSourceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function isValidUrl(value: string): boolean {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

export function AddSourceDialog({ open, onOpenChange }: AddSourceDialogProps) {
    const sourcesQuery = useCalendarSources();
    const createSource = useCreateCalendarSource();

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [urlError, setUrlError] = useState<string | null>(null);

    function reset() {
        setName("");
        setUrl("");
        setUrlError(null);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (!isValidUrl(url)) {
            setUrlError("Bitte eine gültige URL eingeben.");
            return;
        }
        setUrlError(null);

        const color = pickNextCalendarColor(sourcesQuery.data?.length ?? 0);

        createSource.mutate(
            { name, url, color },
            {
                onSuccess: () => {
                    toast.success(`"${name}" hinzugefügt.`);
                    reset();
                    onOpenChange(false);
                },
                onError: (error) => {
                    // The backend already tried to reach the ICS URL and failed — surface
                    // that real reason instead of a generic message.
                    setUrlError(getApiErrorMessage(error));
                },
            },
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset();
                onOpenChange(next);
            }}
        >
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Kalender hinzufügen</DialogTitle>
                    <DialogDescription>Fügt eine ICS-Kalenderquelle hinzu (Google, iCloud, Outlook, …).</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="source-name">Name</Label>
                        <Input id="source-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Privat" required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="source-url">ICS-URL</Label>
                        <Input
                            id="source-url"
                            type="url"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setUrlError(null);
                            }}
                            placeholder="https://calendar.google.com/.../basic.ics"
                            required
                        />
                        {urlError && <p className="text-xs text-rose-500">{urlError}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={createSource.isPending}>
                            {createSource.isPending && <Spinner size={14} className="mr-1" />}
                            Kalender hinzufügen
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
