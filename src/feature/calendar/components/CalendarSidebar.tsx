import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Kalender</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {sources.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">Noch kein Kalender hinzugefügt.</p>
                )}

                {sources.map((source) => (
                    <div key={source.id} className="group flex items-center gap-2.5 rounded-md px-1.5 py-2 hover:bg-muted/50">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: source.color ?? "#64748b" }}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{source.name}</p>
                            <p className="truncate text-xs text-muted-foreground">ICS-Kalender</p>
                        </div>
                        <Switch
                            checked={source.isEnabled}
                            onCheckedChange={(checked) =>
                                updateSource.mutate(
                                    { id: source.id, data: { isEnabled: checked } },
                                    { onError: (error) => toast.error(getApiErrorMessage(error)) },
                                )
                            }
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEditClick(source)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                    Bearbeiten
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-rose-500 focus:text-rose-500"
                                    onClick={() =>
                                        deleteSource.mutate(source.id, {
                                            onSuccess: () => toast.success(`"${source.name}" entfernt.`),
                                            onError: (error) => toast.error(getApiErrorMessage(error)),
                                        })
                                    }
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Löschen
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}

                <Button variant="ghost" size="sm" className="w-full justify-start mt-2" onClick={onAddClick}>
                    <Plus className="h-3.5 w-3.5" />
                    Kalender hinzufügen
                </Button>
            </CardContent>
        </Card>
    );
}
