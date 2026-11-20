import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { PageHeader } from "@/components/layout/page.tsx";
import { useCustomers } from "@/api/customers/hooks.ts";
import { useCreateInvoice, useUpdateInvoice } from "@/api/invoices/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { todayIsoDate } from "@/lib/dateTimeUtils.ts";
import { LineItemsEditor } from "@/feature/business-documents/LineItemsEditor.tsx";
import { EMPTY_LINE_ITEM, validateLineItems, type LineItemInput } from "@/feature/business-documents/lineItems.ts";
import { KIND_LABELS, MAX_PAYMENT_TERM_DAYS } from "@/feature/invoices/invoiceRules.ts";
import type { Invoice, InvoiceInput } from "@/feature/invoices/schema/invoice.ts";

/** Länge laut API für Einleitungs- und Schlusstext. */
const MAX_TEXT_LENGTH = 10000;
const PAYMENT_TERM_PATTERN = /^\d{1,3}$/;

type ServiceMode = "date" | "period";

interface Props {
  /** null = neue (normale) Rechnung anlegen; sonst Entwurf bearbeiten. */
  invoice: Invoice | null;
  onCancel: () => void;
  onSaved: (invoice: Invoice) => void;
}

function toLineItemInputs(invoice: Invoice | null): LineItemInput[] {
  if (invoice === null || invoice.items.length === 0) return [{ ...EMPTY_LINE_ITEM }];
  return invoice.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unitPriceCents: item.unitPriceCents,
  }));
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Anlegen/Bearbeiten eines Rechnungsentwurfs. Wird nur bei Bedarf gemountet (frischer Formularzustand). */
export function InvoiceEditor({ invoice, onCancel, onSaved }: Props) {
  const customers = useCustomers(false);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const [customerId, setCustomerId] = useState(invoice?.customerId ?? "");
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoiceDate ?? todayIsoDate());
  const [serviceMode, setServiceMode] = useState<ServiceMode>(
    invoice?.servicePeriodStart !== null && invoice?.servicePeriodStart !== undefined ? "period" : "date",
  );
  const [serviceDate, setServiceDate] = useState(invoice?.serviceDate ?? "");
  const [periodStart, setPeriodStart] = useState(invoice?.servicePeriodStart ?? "");
  const [periodEnd, setPeriodEnd] = useState(invoice?.servicePeriodEnd ?? "");
  const [paymentTerm, setPaymentTerm] = useState(invoice === null ? "" : String(invoice.paymentTermDays));
  const [introText, setIntroText] = useState(invoice?.introText ?? "");
  const [closingText, setClosingText] = useState(invoice?.closingText ?? "");
  const [items, setItems] = useState<LineItemInput[]>(() => toLineItemInputs(invoice));
  const [areItemsValid, setAreItemsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditing = invoice !== null;
  const isSaving = createInvoice.isPending || updateInvoice.isPending;
  // Aus einem Angebot entstandene Rechnungen behalten den Kunden des Angebots (API lehnt den Wechsel ab)
  const isCustomerLocked = invoice !== null && invoice.offerId !== null;

  // Nur aktive Kunden; der Kunde eines bestehenden Entwurfs bleibt auswählbar, auch wenn er archiviert ist
  const customerOptions = (customers.data ?? []).map((customer) => ({
    id: customer.customerId,
    name: customer.displayName,
  }));
  if (invoice !== null && !customerOptions.some((option) => option.id === invoice.customerId)) {
    customerOptions.push({ id: invoice.customerId, name: invoice.customerName });
  }

  function validate(): string | null {
    if (customerId === "") return "Bitte einen Kunden wählen";
    if (invoiceDate === "") return "Rechnungsdatum ist erforderlich";
    if (serviceMode === "period" && (periodStart === "") !== (periodEnd === "")) {
      return "Leistungszeitraum braucht Beginn und Ende";
    }
    if (serviceMode === "period" && periodStart !== "" && periodEnd < periodStart) {
      return "Das Ende des Leistungszeitraums darf nicht vor dem Beginn liegen";
    }
    if (isEditing || paymentTerm !== "") {
      if (!PAYMENT_TERM_PATTERN.test(paymentTerm) || Number(paymentTerm) > MAX_PAYMENT_TERM_DAYS) {
        return `Zahlungsziel muss eine ganze Zahl von 0 bis ${MAX_PAYMENT_TERM_DAYS} Tagen sein`;
      }
    }
    if (introText.length > MAX_TEXT_LENGTH || closingText.length > MAX_TEXT_LENGTH) {
      return `Texte dürfen höchstens ${MAX_TEXT_LENGTH} Zeichen lang sein`;
    }
    if (!areItemsValid) return "Bitte ungültige Preise oder Mengen in den Positionen korrigieren";
    return validateLineItems(items);
  }

  function buildInput(): InvoiceInput {
    const isPeriod = serviceMode === "period";
    const input: InvoiceInput = {
      customerId,
      invoiceDate,
      // Immer beide Varianten senden; die nicht gewählte als null, damit die API sie leert
      serviceDate: isPeriod ? null : toNullable(serviceDate),
      servicePeriodStart: isPeriod ? toNullable(periodStart) : null,
      servicePeriodEnd: isPeriod ? toNullable(periodEnd) : null,
      introText: toNullable(introText),
      items: items.map((item) => ({ ...item, description: item.description.trim(), unit: item.unit.trim() })),
    };
    const withTerm = paymentTerm === "" ? input : { ...input, paymentTermDays: Number(paymentTerm) };
    // Leer beim Anlegen = Standardtext aus den Firmendaten: Schlüssel weglassen. Beim Bearbeiten heißt leer "kein Text".
    if (isEditing) return { ...withTerm, closingText: toNullable(closingText) };
    const closing = toNullable(closingText);
    return closing === null ? withTerm : { ...withTerm, closingText: closing };
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = validate();
    setError(message);
    if (message !== null) return;

    const options = {
      onSuccess: (saved: Invoice) => {
        toast.success(isEditing ? "Rechnung gespeichert" : "Rechnung angelegt");
        onSaved(saved);
      },
      onError: (mutationError: unknown) => setError(getApiErrorMessage(mutationError)),
    };
    if (invoice === null) {
      createInvoice.mutate(buildInput(), options);
      return;
    }
    updateInvoice.mutate({ invoiceId: invoice.invoiceId, data: buildInput() }, options);
  }

  const title = invoice === null ? "Neue Rechnung" : `${KIND_LABELS[invoice.kind]} bearbeiten`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <PageHeader
        title={title}
        description="Der Entwurf kann beliebig geändert werden. Nummer und PDF entstehen erst beim Festschreiben."
        actions={
          <>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSaving || !areItemsValid}>
              {isSaving && <Loader2 className="animate-spin" />}
              Speichern
            </Button>
          </>
        }
      />

      {error !== null && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {invoice?.kind === "final" && (
        <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Die Anzahlung wird beim Festschreiben automatisch abgezogen.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="invoice-customer">Kunde</Label>
          <Select value={customerId} onValueChange={setCustomerId} disabled={isSaving || isCustomerLocked}>
            <SelectTrigger id="invoice-customer">
              <SelectValue placeholder={customers.isPending ? "Wird geladen" : "Kunde wählen"} />
            </SelectTrigger>
            <SelectContent>
              {customerOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isCustomerLocked && <p className="text-xs text-muted-foreground">Kunde aus dem Angebot, nicht änderbar.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-date">Rechnungsdatum</Label>
          <Input
            id="invoice-date"
            type="date"
            value={invoiceDate}
            onChange={(event) => setInvoiceDate(event.target.value)}
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-term">Zahlungsziel (Tage)</Label>
          <Input
            id="invoice-term"
            inputMode="numeric"
            value={paymentTerm}
            onChange={(event) => setPaymentTerm(event.target.value.trim())}
            placeholder={isEditing ? undefined : "Standard aus Einstellungen"}
            disabled={isSaving}
          />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-xl border p-4">
        <legend className="px-1 text-sm font-medium">Leistung</legend>
        <RadioGroup
          value={serviceMode}
          onValueChange={(value) => setServiceMode(value === "period" ? "period" : "date")}
          className="flex flex-wrap gap-4"
          disabled={isSaving}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="date" id="invoice-service-mode-date" />
            <Label htmlFor="invoice-service-mode-date" className="font-normal">
              Leistungsdatum
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="period" id="invoice-service-mode-period" />
            <Label htmlFor="invoice-service-mode-period" className="font-normal">
              Leistungszeitraum
            </Label>
          </div>
        </RadioGroup>
        {serviceMode === "date" && (
          <div className="space-y-2 sm:w-1/3">
            <Label htmlFor="invoice-service-date">Leistungsdatum</Label>
            <Input
              id="invoice-service-date"
              type="date"
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
              disabled={isSaving}
            />
          </div>
        )}
        {serviceMode === "period" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="invoice-period-start">Beginn</Label>
              <Input
                id="invoice-period-start"
                type="date"
                value={periodStart}
                onChange={(event) => setPeriodStart(event.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-period-end">Ende</Label>
              <Input
                id="invoice-period-end"
                type="date"
                value={periodEnd}
                onChange={(event) => setPeriodEnd(event.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Pflicht für das Festschreiben (§ 14 UStG). Der Entwurf kann auch ohne gespeichert werden.
        </p>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="invoice-intro">
          Einleitung <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="invoice-intro" value={introText} onChange={(event) => setIntroText(event.target.value)} rows={3} />
      </div>

      <section className="space-y-3" aria-labelledby="invoice-items-heading">
        <h2 id="invoice-items-heading" className="text-base font-semibold">
          Positionen
        </h2>
        <LineItemsEditor value={items} onChange={setItems} disabled={isSaving} onValidityChange={setAreItemsValid} />
      </section>

      <div className="space-y-2">
        <Label htmlFor="invoice-closing">
          Schlusstext <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="invoice-closing"
          value={closingText}
          onChange={(event) => setClosingText(event.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {isEditing ? "Leer lassen = kein Schlusstext." : "Leer lassen = Standardtext aus den Einstellungen."}
        </p>
      </div>
    </form>
  );
}
