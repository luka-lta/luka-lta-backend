import { useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Button } from "@/components/ui/button.tsx";
import { RowActions } from "@/components/data/row-actions.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import type { CalendarSource } from "@/api/calendar/schema.ts";
import { useDeleteCalendarSource, useUpdateCalendarSource } from "@/api/calendar/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";

interface CalendarSidebarProps {
    sources: CalendarSource[];
    onAddClick: () => void;
    onEditClick: (source: CalendarSource) => void;
}

export function CalendarSidebar({ sources, onAddClick, onEditClick }: CalendarSidebarProps) {
    const updateSource = useUpdateCalendarSource();
    const deleteSource = useDeleteCalendarSource();
    const [toDelete, setToDelete] = useState<CalendarSource | null>(null);

    return (
        <Card className="lg:self-start">
            <CardHeader className="pb-3">
                <CardTitle>Meine Kalender</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {sources.length === 0 ? (
                    <EmptyState
                        variant="plain"
                        className="px-0 py-6"
                        icon={CalendarPlus}
                        title="Noch kein Kalender"
                        description="Binde einen ICS-Kalender ein, um Termine zu sehen."
                    />
                ) : (
                    <ul className="-mx-1.5 space-y-0.5">
                        {sources.map((source) => (
                            <li key={source.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-muted/40">
                                <span
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: source.color ?? "hsl(var(--muted-foreground))" }}
                                    aria-hidden
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{source.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{source.isEnabled ? "Eingeblendet" : "Ausgeblendet"}</p>
                                </div>
                                <Switch
                                    checked={source.isEnabled}
                                    aria-label={`${source.name} anzeigen`}
                                    onCheckedChange={(checked) =>
                                        updateSource.mutate(
                                            { id: source.id, data: { isEnabled: checked } },
                                            { onError: (error) => toast.error(getApiErrorMessage(error)) },
                                        )
                                    }
                                />
                                <RowActions
                                    label={source.name}
                                    actions={[
                                        { label: "Bearbeiten", icon: Pencil, onSelect: () => onEditClick(source) },
                                        { label: "Entfernen", icon: Trash2, destructive: true, onSelect: () => setToDelete(source) },
                                    ]}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={onAddClick}>
                    <CalendarPlus />
                    Kalender hinzufügen
                </Button>
            </CardContent>

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => !open && setToDelete(null)}
                destructive
                title="Kalender entfernen?"
                description={
                    <>
                        <span className="font-medium text-foreground">{toDelete?.name}</span> wird aus dem Dashboard entfernt.
                        Der Kalender selbst bleibt beim Anbieter unverändert.
                    </>
                }
                confirmLabel="Entfernen"
                isLoading={deleteSource.isPending}
                onConfirm={() => {
                    if (!toDelete) return;
                    deleteSource.mutate(toDelete.id, {
                        onSuccess: () => {
                            toast.success(`Kalender „${toDelete.name}“ entfernt`);
                            setToDelete(null);
                        },
                        onError: (error) => toast.error(getApiErrorMessage(error)),
                    });
                }}
            />
        </Card>
    );
}
