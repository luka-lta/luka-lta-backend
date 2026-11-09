import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import type { CalendarSource } from "@/api/calendar/schema.ts";
import { useUpdateCalendarSource } from "@/api/calendar/hooks.ts";
import { CALENDAR_COLOR_NAMES, CALENDAR_COLOR_PALETTE } from "@/feature/calendar/calendarColors.ts";
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
                    toast.success("Kalender gespeichert");
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <FormDialog
            open={source !== null}
            onOpenChange={onOpenChange}
            size="sm"
            title="Kalender bearbeiten"
            onSubmit={handleSubmit}
            submitLabel="Speichern"
            isSubmitting={updateSource.isPending}
            submitDisabled={!name.trim() || !url.trim()}
        >
            <div className="space-y-2">
                <Label htmlFor="edit-source-name">Name</Label>
                <Input id="edit-source-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-source-url">ICS-URL</Label>
                <Input id="edit-source-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label id="edit-source-color">Farbe</Label>
                <div role="radiogroup" aria-labelledby="edit-source-color" className="flex flex-wrap gap-2">
                    {CALENDAR_COLOR_PALETTE.map((c) => {
                        const selected = color === c;
                        return (
                            <button
                                key={c}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                aria-label={CALENDAR_COLOR_NAMES[c] ?? c}
                                onClick={() => setColor(c)}
                                className={cn(
                                    "flex size-7 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    selected && "ring-2 ring-foreground",
                                )}
                                style={{ backgroundColor: c }}
                            >
                                {selected && <Check className="size-3.5" aria-hidden />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </FormDialog>
    );
}
