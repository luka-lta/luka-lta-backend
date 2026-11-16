import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
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
                    toast.success(`Kalender „${name}“ hinzugefügt`);
                    reset();
                    onOpenChange(false);
                },
                // Die API hat die ICS-URL bereits abgerufen – den echten Grund zeigen.
                onError: (error) => setUrlError(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <FormDialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset();
                onOpenChange(next);
            }}
            size="sm"
            title="Kalender hinzufügen"
            description="ICS-Kalender aus Google, iCloud, Outlook & Co. einbinden."
            onSubmit={handleSubmit}
            submitLabel="Hinzufügen"
            isSubmitting={createSource.isPending}
            submitDisabled={!name.trim() || !url.trim()}
        >
            <div className="space-y-2">
                <Label htmlFor="source-name">Name</Label>
                <Input id="source-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Privat" autoFocus />
            </div>
            <div className="space-y-2">
                <Label htmlFor="source-url" className={urlError ? "text-destructive" : undefined}>ICS-URL</Label>
                <Input
                    id="source-url"
                    type="url"
                    value={url}
                    aria-invalid={!!urlError}
                    aria-describedby={urlError ? "source-url-error" : "source-url-description"}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        setUrlError(null);
                    }}
                    placeholder="https://…/basic.ics"
                />
                {urlError ? (
                    <p id="source-url-error" className="text-sm text-destructive">{urlError}</p>
                ) : (
                    <p id="source-url-description" className="text-xs text-muted-foreground">
                        Die geheime ICS-Adresse findest du in den Freigabe-Einstellungen deines Kalenders.
                    </p>
                )}
            </div>
        </FormDialog>
    );
}
