import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import {
  useBusinessSettings,
  useSaveBusinessSettings,
  useUploadBusinessLogo,
} from "@/api/business-settings/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import {
  businessSettingsFormSchema,
  type BusinessSettings,
  type BusinessSettingsFormValues,
  type BusinessSettingsInput,
} from "@/feature/business-settings/schema/businessSettings.ts";

/** Standard-Zahlungsziel in Tagen für ein leeres Formular (wie API). */
const DEFAULT_PAYMENT_TERM_DAYS = 14;

/** Logo-Obergrenze laut API: 2 MiB in Bytes. */
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const LOGO_MIME_TYPES = ["image/png", "image/jpeg"];

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function buildDefaultValues(settings: BusinessSettings | null): BusinessSettingsFormValues {
  return {
    companyName: settings?.companyName ?? "",
    ownerName: settings?.ownerName ?? "",
    street: settings?.street ?? "",
    postalCode: settings?.postalCode ?? "",
    city: settings?.city ?? "",
    email: settings?.email ?? "",
    phone: settings?.phone ?? "",
    taxNumber: settings?.taxNumber ?? "",
    bankName: settings?.bankName ?? "",
    iban: settings?.iban ?? "",
    bic: settings?.bic ?? "",
    defaultPaymentTermDays: String(settings?.defaultPaymentTermDays ?? DEFAULT_PAYMENT_TERM_DAYS),
    footerText: settings?.footerText ?? "",
  };
}

function buildInput(values: BusinessSettingsFormValues): BusinessSettingsInput {
  return {
    companyName: values.companyName,
    ownerName: values.ownerName,
    street: values.street,
    postalCode: values.postalCode,
    city: values.city,
    email: values.email,
    phone: toNullable(values.phone),
    taxNumber: values.taxNumber,
    bankName: values.bankName,
    iban: values.iban,
    bic: toNullable(values.bic),
    defaultPaymentTermDays: Number(values.defaultPaymentTermDays),
    footerText: toNullable(values.footerText),
  };
}

interface LogoSectionProps {
  settings: BusinessSettings | null;
}

function LogoSection({ settings }: LogoSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadLogo = useUploadBusinessLogo();
  const canUpload = settings !== null;

  function handleFileChange(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!LOGO_MIME_TYPES.includes(file.type)) {
      toast.error("Das Logo muss ein PNG oder JPEG sein.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Das Logo darf höchstens 2 MiB groß sein.");
      return;
    }
    uploadLogo.mutate(file, {
      onSuccess: () => toast.success("Logo hochgeladen"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function describeStatus(): string {
    if (!canUpload) return "Speichere zuerst die Firmendaten, dann kann ein Logo hochgeladen werden.";
    return settings.hasLogo ? "Ein Logo ist hinterlegt." : "Noch kein Logo hinterlegt.";
  }

  return (
    <section className="space-y-3 rounded-xl border bg-card p-6" aria-labelledby="logo-heading">
      <div className="space-y-1">
        <h2 id="logo-heading" className="text-section-title">
          Logo
        </h2>
        <p className="text-sm text-muted-foreground">PNG oder JPEG, höchstens 2 MiB. Erscheint auf den PDFs.</p>
      </div>
      <p className="text-sm" role="status">
        {describeStatus()}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={LOGO_MIME_TYPES.join(",")}
        className="sr-only"
        aria-label="Logo-Datei auswählen"
        tabIndex={-1}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        disabled={!canUpload || uploadLogo.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {uploadLogo.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
        {canUpload && settings.hasLogo ? "Logo ersetzen" : "Logo hochladen"}
      </Button>
    </section>
  );
}

interface SettingsFormProps {
  settings: BusinessSettings | null;
}

function SettingsForm({ settings }: SettingsFormProps) {
  const form = useForm<BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsFormSchema),
    defaultValues: buildDefaultValues(settings),
  });
  const saveSettings = useSaveBusinessSettings();

  // Nach dem Speichern (bzw. Logo-Upload) die normalisierten Serverwerte übernehmen.
  const { reset } = form;
  useEffect(() => {
    reset(buildDefaultValues(settings));
  }, [settings, reset]);

  const handleSubmit = form.handleSubmit((values) => {
    saveSettings.mutate(buildInput(values), {
      onSuccess: () => toast.success("Firmendaten gespeichert"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="space-y-4 rounded-xl border bg-card p-6" aria-labelledby="company-heading">
        <h2 id="company-heading" className="text-section-title">
          Firma
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput form={form} id="bs-company" name="companyName" label="Firmenname" />
          <TextInput form={form} id="bs-owner" name="ownerName" label="Inhaber" />
        </div>
        <TextInput form={form} id="bs-street" name="street" label="Straße und Hausnummer" autoComplete="off" />
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <TextInput form={form} id="bs-postal" name="postalCode" label="PLZ" autoComplete="off" />
          <TextInput form={form} id="bs-city" name="city" label="Ort" autoComplete="off" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput form={form} id="bs-email" name="email" type="email" label="E-Mail" />
          <TextInput form={form} id="bs-phone" name="phone" label="Telefon" optional />
        </div>
        <TextInput form={form} id="bs-tax" name="taxNumber" label="Steuernummer" autoComplete="off" />
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6" aria-labelledby="bank-heading">
        <h2 id="bank-heading" className="text-section-title">
          Bankverbindung
        </h2>
        <TextInput form={form} id="bs-bank" name="bankName" label="Bank" autoComplete="off" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            form={form}
            id="bs-iban"
            name="iban"
            label="IBAN"
            autoComplete="off"
            description="Leerzeichen sind erlaubt."
          />
          <TextInput form={form} id="bs-bic" name="bic" label="BIC" autoComplete="off" optional />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6" aria-labelledby="docs-heading">
        <h2 id="docs-heading" className="text-section-title">
          Belege
        </h2>
        <TextInput
          form={form}
          id="bs-term"
          name="defaultPaymentTermDays"
          type="number"
          label="Standard-Zahlungsziel (Tage)"
          description="Vorgabe für neue Rechnungen."
        />
        <div className="space-y-2">
          <Label htmlFor="bs-footer">
            Fußtext<span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea id="bs-footer" rows={4} {...form.register("footerText")} />
          {form.formState.errors.footerText && (
            <p className="text-xs font-medium text-destructive">{form.formState.errors.footerText.message}</p>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saveSettings.isPending}>
          {saveSettings.isPending && <Loader2 className="animate-spin" />}
          Speichern
        </Button>
      </div>
    </form>
  );
}

export default function BusinessSettingsFeature() {
  const settings = useBusinessSettings();

  function renderContent() {
    if (settings.error) {
      return (
        <ErrorState
          title="Firmendaten konnten nicht geladen werden"
          error={settings.error}
          onRetry={() => settings.refetch()}
        />
      );
    }
    if (settings.isPending) {
      return (
        <div className="space-y-4" aria-busy="true" aria-label="Wird geladen">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      );
    }
    return (
      <>
        {settings.data === null && (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>Firmendaten unvollständig</AlertTitle>
            <AlertDescription>Ohne vollständige Firmendaten können keine Dokumente festgeschrieben werden</AlertDescription>
          </Alert>
        )}
        <SettingsForm settings={settings.data} />
        <LogoSection settings={settings.data} />
      </>
    );
  }

  return (
    <PageContainer title="Firmendaten" width="narrow">
      <PageHeader title="Firmendaten" description="Absenderdaten für Angebote und Rechnungen." />
      {renderContent()}
    </PageContainer>
  );
}
