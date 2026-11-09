import { useEffect, useState } from "react";
import { Controller, type UseFormRegisterReturn, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialogs/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
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
                toast.success(mode === "create" ? "App angelegt" : "App gespeichert");
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        });
    }

    const errors = form.formState.errors;

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            size="lg"
            title={mode === "create" ? "App anlegen" : "App bearbeiten"}
            description="Apps, Webseiten und Produkte mit ihren Kennzahlen und Analytics-Quellen."
            onSubmit={form.handleSubmit(onSubmit)}
            submitLabel={mode === "create" ? "App anlegen" : "Speichern"}
            isSubmitting={isPending}
            submitDisabled={addingSourceType !== null}
        >
            <fieldset className="space-y-5">
                <legend className="sr-only">Grunddaten</legend>
                <div className="space-y-2">
                    <Label htmlFor="app-name" className={errors.name ? "text-destructive" : undefined}>Name</Label>
                    <Input id="app-name" placeholder="z. B. PixelDiary" aria-invalid={!!errors.name} {...form.register("name")} />
                    <FieldError message={errors.name?.message} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="app-description">
                        Beschreibung <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Textarea id="app-description" rows={2} className="resize-none" aria-invalid={!!errors.description} {...form.register("description")} />
                    <FieldError message={errors.description?.message} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="app-category">Kategorie</Label>
                        <Controller
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="app-category"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="app-status">Status</Label>
                        <Controller
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="app-status"><SelectValue /></SelectTrigger>
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

                <div className="space-y-2">
                    <Label htmlFor="app-url" className={errors.url ? "text-destructive" : undefined}>
                        URL <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input id="app-url" type="url" placeholder="https://" aria-invalid={!!errors.url} {...form.register("url")} />
                    <FieldError message={errors.url?.message} />
                </div>

                <div className="space-y-2">
                    <Label id="app-icon-label">Icon</Label>
                    <Controller
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <div role="radiogroup" aria-labelledby="app-icon-label" className="grid grid-cols-6 gap-2 sm:grid-cols-10">
                                {Object.entries(APP_ICON_OPTIONS).map(([key, Icon]) => {
                                    const selected = field.value === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            aria-label={key}
                                            onClick={() => field.onChange(key)}
                                            className={cn(
                                                "flex aspect-square items-center justify-center rounded-md border bg-card transition-colors duration-fast hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                selected && "border-primary bg-primary/10 text-primary hover:bg-primary/10",
                                            )}
                                        >
                                            <Icon className="size-4" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    />
                </div>
            </fieldset>

            <fieldset className="space-y-3 border-t pt-5">
                <legend className="float-left mb-1 w-full text-sm font-semibold">Analytics-Quellen</legend>
                <p className="clear-both text-xs text-muted-foreground">Zugangsdaten werden nur in dieser Demo-Registry gehalten.</p>

                {sourcesFieldArray.fields.length > 0 && (
                    <ul className="space-y-2">
                        {sourcesFieldArray.fields.map((field, index) => (
                            <li key={field.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                                <span className="truncate text-sm font-medium">{ANALYTICS_SOURCE_TYPE_LABELS[field.type]}</span>
                                <div className="flex shrink-0 items-center gap-1">
                                    <Controller
                                        control={form.control}
                                        name={`analyticsSources.${index}.enabled`}
                                        render={({ field: enabledField }) => (
                                            <Switch
                                                checked={enabledField.value}
                                                onCheckedChange={enabledField.onChange}
                                                aria-label={`${ANALYTICS_SOURCE_TYPE_LABELS[field.type]} aktiv`}
                                            />
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => sourcesFieldArray.remove(index)}
                                        aria-label={`${ANALYTICS_SOURCE_TYPE_LABELS[field.type]} entfernen`}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {addingSourceType ? (
                    <div className="space-y-3 rounded-lg border border-dashed p-3">
                        <div className="space-y-2">
                            <Label htmlFor="new-source-type">Typ</Label>
                            <Select value={addingSourceType} onValueChange={(v) => { setAddingSourceType(v as typeof addingSourceType); setNewSourceCredentials({}); }}>
                                <SelectTrigger id="new-source-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ANALYTICS_SOURCE_TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {ANALYTICS_CREDENTIAL_FIELDS[addingSourceType].map((field) => (
                            <div key={field.key} className="space-y-2">
                                <Label htmlFor={`new-source-${field.key}`}>{field.label}</Label>
                                {field.multiline ? (
                                    <Textarea
                                        id={`new-source-${field.key}`}
                                        rows={2}
                                        className="resize-none font-mono text-xs"
                                        value={newSourceCredentials[field.key] ?? ""}
                                        onChange={(e) => setNewSourceCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                    />
                                ) : (
                                    <Input
                                        id={`new-source-${field.key}`}
                                        type="password"
                                        autoComplete="off"
                                        value={newSourceCredentials[field.key] ?? ""}
                                        onChange={(e) => setNewSourceCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddSource();
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => { setAddingSourceType(null); setNewSourceCredentials({}); }}>
                                Abbrechen
                            </Button>
                            <Button type="button" size="sm" onClick={handleAddSource}>
                                Quelle hinzufügen
                            </Button>
                        </div>
                        <p className="text-xs text-warning">Erst hinzufügen oder abbrechen, dann speichern.</p>
                    </div>
                ) : (
                    <Button type="button" variant="outline" size="sm" onClick={() => setAddingSourceType("app-store-connect")}>
                        <Plus />
                        Quelle hinzufügen
                    </Button>
                )}
            </fieldset>

            <fieldset className="space-y-3 border-t pt-5">
                <legend className="float-left mb-1 w-full text-sm font-semibold">
                    Kennzahlen <span className="font-normal text-muted-foreground">(optional)</span>
                </legend>
                <div className="clear-both grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <MetricInput id="app-revenue" label="Umsatz (€)" inputMode="decimal" error={errors.metricsRevenue?.message} registration={form.register("metricsRevenue")} />
                    <MetricInput id="app-downloads" label="Downloads" inputMode="numeric" error={errors.metricsDownloads?.message} registration={form.register("metricsDownloads")} />
                    <MetricInput id="app-rating" label="Bewertung (0–5)" inputMode="decimal" error={errors.metricsRating?.message} registration={form.register("metricsRating")} />
                    <MetricInput id="app-mrr" label="MRR (€)" inputMode="decimal" error={errors.metricsMrr?.message} registration={form.register("metricsMrr")} />
                    <MetricInput id="app-active-users" label="Aktive Nutzer" inputMode="numeric" error={errors.metricsActiveUsers?.message} registration={form.register("metricsActiveUsers")} />
                    <MetricInput id="app-churn" label="Churn (%)" inputMode="decimal" error={errors.metricsChurnPercent?.message} registration={form.register("metricsChurnPercent")} />
                </div>
            </fieldset>
        </FormDialog>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-destructive">{message}</p>;
}

function MetricInput({
    id,
    label,
    inputMode,
    error,
    registration,
}: {
    id: string;
    label: string;
    inputMode: "decimal" | "numeric";
    error?: string;
    registration: UseFormRegisterReturn;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className={error ? "text-destructive" : undefined}>{label}</Label>
            <Input id={id} inputMode={inputMode} className="tabular-nums" aria-invalid={!!error} {...registration} />
            <FieldError message={error} />
        </div>
    );
}
