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
import type { CalendarSource } from "@/api/calendar/schema.ts";
import { useUpdateCalendarSource } from "@/api/calendar/hooks.ts";
import { CALENDAR_COLOR_PALETTE } from "@/feature/calendar/calendarColors.ts";
import { cn } from "@/lib/utils.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface EditSourceDialogProps {
    source: CalendarSource | null;
    onOpenChange: (open: boolean) => void;
}

export function EditSourceDialog({ source, onOpenChange }: EditSourceDialogProps) {
    const updateSource = useUpdateCalendarSource();

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [color, setColor] = useState(CALENDAR_COLOR_PALETTE[0]);

    useEffect(() => {
        if (source) {
            setName(source.name);
            setUrl(source.url);
            setColor(source.color ?? CALENDAR_COLOR_PALETTE[0]);
        }
    }, [source]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!source) return;

        updateSource.mutate(
            { id: source.id, data: { name, url, color } },
            {
                onSuccess: () => {
                    toast.success("Kalender aktualisiert.");
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <Dialog open={source !== null} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Kalender bearbeiten</DialogTitle>
                    <DialogDescription>Name, URL und Farbe dieser Kalenderquelle ändern.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-source-name">Name</Label>
                        <Input id="edit-source-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-source-url">ICS-URL</Label>
                        <Input id="edit-source-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Farbe</Label>
                        <div className="flex flex-wrap gap-2">
                            {CALENDAR_COLOR_PALETTE.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "h-6 w-6 rounded-full ring-offset-2 ring-offset-background",
                                        color === c && "ring-2 ring-foreground",
                                    )}
                                    style={{ backgroundColor: c }}
                                    aria-label={c}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={updateSource.isPending}>
                            Speichern
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
