import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/kibo-ui/spinner";
import { AppAnalyticsSourceTypeSchema, AppCategorySchema, AppIconKeySchema, AppStatusSchema, type AppEntity, type AppInput } from "@/api/apps/schema";
import { useCreateApp, useUpdateApp } from "@/api/apps/hooks";
import { APP_ICON_OPTIONS } from "@/feature/apps/iconOptions";
import { ANALYTICS_CREDENTIAL_FIELDS, ANALYTICS_SOURCE_TYPE_LABELS, CATEGORY_LABELS, STATUS_LABELS } from "@/feature/apps/labels";

const appFormSchema = z.object({
    name: z.string().min(1, "Name ist erforderlich").max(100, "Maximal 100 Zeichen"),
    description: z.string().max(500, "Maximal 500 Zeichen"),
    icon: AppIconKeySchema,
    category: AppCategorySchema,
    status: AppStatusSchema,
    analyticsSources: z.array(z.object({
        id: z.string(),
        type: AppAnalyticsSourceTypeSchema,
        enabled: z.boolean(),
        credentials: z.record(z.string(), z.string()),
    })),
    url: z.string().max(2048).refine((val) => {
        if (val === "") return true;
        try {
            new URL(val);
            return /^https?:\/\//.test(val);
        } catch {
            return false;
        }
    }, {
        message: "Muss eine gültige URL sein (http:// oder https://)",
    }),
    metricsRevenue: z.string()
        .refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein")
        .refine((v) => v === "" || Number(v) >= 0, "Muss 0 oder größer sein"),
    metricsDownloads: z.string()
        .refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein")
        .refine((v) => v === "" || Number(v) >= 0, "Muss 0 oder größer sein")
        .refine((v) => v === "" || Number.isInteger(Number(v)), "Muss eine ganze Zahl sein"),
    metricsRating: z.string()
        .refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein")
        .refine((v) => v === "" || (Number(v) >= 0 && Number(v) <= 5), "Muss zwischen 0 und 5 liegen"),
    metricsMrr: z.string()
        .refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein")
        .refine((v) => v === "" || Number(v) >= 0, "Muss 0 oder größer sein"),
    metricsActiveUsers: z.string()
        .refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein")
        .refine((v) => v === "" || Number(v) >= 0, "Muss 0 oder größer sein")
        .refine((v) => v === "" || Number.isInteger(Number(v)), "Muss eine ganze Zahl sein"),
    metricsChurnPercent: z.string()
        .refine((v) => v === "" || !Number.isNaN(Number(v)), "Muss eine Zahl sein")
        .refine((v) => v === "" || (Number(v) >= 0 && Number(v) <= 100), "Muss zwischen 0 und 100 liegen"),
});

type AppFormValues = z.infer<typeof appFormSchema>;

const emptyFormValues: AppFormValues = {
    name: "",
    description: "",
    icon: "boxes",
    category: "other",
    status: "active",
    analyticsSources: [],
    url: "",
    metricsRevenue: "",
    metricsDownloads: "",
    metricsRating: "",
    metricsMrr: "",
    metricsActiveUsers: "",
    metricsChurnPercent: "",
};

function toFormValues(app: AppEntity): AppFormValues {
    return {
        name: app.name,
        description: app.description,
        icon: app.icon,
        category: app.category,
        status: app.status,
        analyticsSources: app.analyticsSources,
        url: app.url ?? "",
        metricsRevenue: app.metrics?.revenue?.toString() ?? "",
        metricsDownloads: app.metrics?.downloads?.toString() ?? "",
        metricsRating: app.metrics?.rating?.toString() ?? "",
        metricsMrr: app.metrics?.mrr?.toString() ?? "",
        metricsActiveUsers: app.metrics?.activeUsers?.toString() ?? "",
        metricsChurnPercent: app.metrics?.churnPercent?.toString() ?? "",
    };
}

function parseOptionalNumber(value: string): number | undefined {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}

function toAppInput(values: AppFormValues): AppInput {
    const metrics = {
        revenue: parseOptionalNumber(values.metricsRevenue),
        downloads: parseOptionalNumber(values.metricsDownloads),
        rating: parseOptionalNumber(values.metricsRating),
        mrr: parseOptionalNumber(values.metricsMrr),
        activeUsers: parseOptionalNumber(values.metricsActiveUsers),
        churnPercent: parseOptionalNumber(values.metricsChurnPercent),
    };
    const hasMetrics = Object.values(metrics).some((v) => v !== undefined);

    return {
        name: values.name,
        description: values.description,
        icon: values.icon,
        category: values.category,
        status: values.status,
        analyticsSources: values.analyticsSources,
        url: values.url.trim() === "" ? undefined : values.url.trim(),
        metrics: hasMetrics ? metrics : undefined,
    };
}

interface AppFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    defaultValues?: AppEntity;
}

export function AppFormDialog({ open, onOpenChange, mode, defaultValues }: AppFormDialogProps) {
    const createApp = useCreateApp();
    const updateApp = useUpdateApp(defaultValues?.id ?? "");
    const isPending = mode === "create" ? createApp.isPending : updateApp.isPending;

    const form = useForm<AppFormValues>({
        resolver: zodResolver(appFormSchema),
        defaultValues: emptyFormValues,
    });

    const sourcesFieldArray = useFieldArray({ control: form.control, name: "analyticsSources" });
    const [addingSourceType, setAddingSourceType] = useState<z.infer<typeof AppAnalyticsSourceTypeSchema> | null>(null);
    const [newSourceCredentials, setNewSourceCredentials] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open) return;
        form.reset(defaultValues ? toFormValues(defaultValues) : emptyFormValues);
        setAddingSourceType(null);
        setNewSourceCredentials({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, defaultValues?.id]);

    function handleAddSource() {
        if (!addingSourceType) return;
        sourcesFieldArray.append({
            id: crypto.randomUUID(),
            type: addingSourceType,
            enabled: true,
            credentials: newSourceCredentials,
        });
        setAddingSourceType(null);
        setNewSourceCredentials({});
    }

    function onSubmit(values: AppFormValues) {
        const input = toAppInput(values);
        const mutation = mode === "create" ? createApp : updateApp;

        mutation.mutate(input, {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(mode === "create" ? "App angelegt" : "App aktualisiert");
            },
            onError: (error) => toast.error(error.message),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Neue App anlegen" : "App bearbeiten"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="app-name">Name *</Label>
                        <Input id="app-name" placeholder="z. B. PixelDiary" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="app-description">Beschreibung</Label>
                        <Textarea id="app-description" rows={2} className="resize-none" {...form.register("description")} />
                        {form.formState.errors.description && (
                            <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Kategorie</Label>
                            <Controller
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <Controller
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <fieldset className="space-y-3 rounded-md border p-3">
                        <legend className="px-1 text-sm font-medium">Analytics-Quellen</legend>

                        {sourcesFieldArray.fields.length > 0 && (
                            <ul className="space-y-2">
                                {sourcesFieldArray.fields.map((field, index) => (
                                    <li key={field.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-sm font-medium truncate">
                                                {ANALYTICS_SOURCE_TYPE_LABELS[field.type]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Controller
                                                control={form.control}
                                                name={`analyticsSources.${index}.enabled`}
                                                render={({ field: enabledField }) => (
                                                    <Switch checked={enabledField.value} onCheckedChange={enabledField.onChange} />
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => sourcesFieldArray.remove(index)}
                                                aria-label="Quelle entfernen"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {addingSourceType ? (
                            <div className="space-y-3 rounded-md border border-dashed p-3">
                                <div className="space-y-1.5">
                                    <Label>Typ</Label>
                                    <Select value={addingSourceType} onValueChange={(v) => { setAddingSourceType(v as typeof addingSourceType); setNewSourceCredentials({}); }}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(ANALYTICS_SOURCE_TYPE_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {ANALYTICS_CREDENTIAL_FIELDS[addingSourceType].map((field) => (
                                    <div key={field.key} className="space-y-1.5">
                                        <Label htmlFor={`new-source-${field.key}`} className="text-xs">{field.label}</Label>
                                        {field.multiline ? (
                                            <Textarea
                                                id={`new-source-${field.key}`}
                                                rows={2}
                                                className="resize-none"
                                                value={newSourceCredentials[field.key] ?? ""}
                                                onChange={(e) => setNewSourceCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                            />
                                        ) : (
                                            <Input
                                                id={`new-source-${field.key}`}
                                                type="password"
                                                value={newSourceCredentials[field.key] ?? ""}
                                                onChange={(e) => setNewSourceCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                            />
                                        )}
                                    </div>
                                ))}

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => { setAddingSourceType(null); setNewSourceCredentials({}); }}>
                                        Abbrechen
                                    </Button>
                                    <Button type="button" size="sm" onClick={handleAddSource}>
                                        Hinzufügen
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAddingSourceType("app-store-connect")}
                            >
                                <Plus className="h-4 w-4" />
                                Quelle hinzufügen
                            </Button>
                        )}
                    </fieldset>

                    <div className="space-y-1.5">
                        <Label>Icon</Label>
                        <Controller
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(APP_ICON_OPTIONS).map(([key, Icon]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => field.onChange(key)}
                                            className={`flex items-center justify-center rounded-md border p-2 hover:bg-muted ${field.value === key ? "border-primary bg-muted" : "border-border"}`}
                                            aria-label={key}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="app-url">URL</Label>
                        <Input id="app-url" placeholder="https://..." {...form.register("url")} />
                        {form.formState.errors.url && (
                            <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
                        )}
                    </div>

                    <fieldset className="space-y-3 rounded-md border p-3">
                        <legend className="px-1 text-sm font-medium">Metriken (optional)</legend>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="app-revenue" className="text-xs">Umsatz (€)</Label>
                                <Input id="app-revenue" inputMode="decimal" {...form.register("metricsRevenue")} />
                                {form.formState.errors.metricsRevenue && (
                                    <p className="text-sm text-destructive">{form.formState.errors.metricsRevenue.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-downloads" className="text-xs">Downloads</Label>
                                <Input id="app-downloads" inputMode="numeric" {...form.register("metricsDownloads")} />
                                {form.formState.errors.metricsDownloads && (
                                    <p className="text-sm text-destructive">{form.formState.errors.metricsDownloads.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-rating" className="text-xs">Rating (0-5)</Label>
                                <Input id="app-rating" inputMode="decimal" {...form.register("metricsRating")} />
                                {form.formState.errors.metricsRating && (
                                    <p className="text-sm text-destructive">{form.formState.errors.metricsRating.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-mrr" className="text-xs">MRR (€)</Label>
                                <Input id="app-mrr" inputMode="decimal" {...form.register("metricsMrr")} />
                                {form.formState.errors.metricsMrr && (
                                    <p className="text-sm text-destructive">{form.formState.errors.metricsMrr.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-active-users" className="text-xs">Aktive User</Label>
                                <Input id="app-active-users" inputMode="numeric" {...form.register("metricsActiveUsers")} />
                                {form.formState.errors.metricsActiveUsers && (
                                    <p className="text-sm text-destructive">{form.formState.errors.metricsActiveUsers.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="app-churn" className="text-xs">Churn (%)</Label>
                                <Input id="app-churn" inputMode="decimal" {...form.register("metricsChurnPercent")} />
                                {form.formState.errors.metricsChurnPercent && (
                                    <p className="text-sm text-destructive">{form.formState.errors.metricsChurnPercent.message}</p>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Abbrechen
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Spinner size={14} />}
                            {mode === "create" ? "Anlegen" : "Speichern"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
