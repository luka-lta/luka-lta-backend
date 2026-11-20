import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useCustomers } from "@/api/customers/hooks.ts";
import { useImportInvoice } from "@/api/invoices/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { todayIsoDate } from "@/lib/dateTimeUtils.ts";
import { parseEuroInput } from "@/feature/business-documents/money.ts";
import { CustomerFormDialog } from "@/feature/customers/components/CustomerFormDialog.tsx";
import {
  getLatestDueDate,
  MAX_IMPORT_PDF_BYTES,
  MAX_IMPORT_TOTAL_CENTS,
  validateImportInvoiceNumber,
} from "@/feature/invoices/invoiceRules.ts";
import type { ImportInvoiceInput, Invoice } from "@/feature/invoices/schema/invoice.ts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (invoice: Invoice) => void;
}

type ImportStatus = ImportInvoiceInput["status"];

const PDF_MIME_TYPE = "application/pdf";

function toNullable(value: string): string | null {
  return value === "" ? null : value;
}

/**
 * Bestandsrechnung (bereits außerhalb erstellt) mit PDF übernehmen. Die Prüfungen spiegeln die API
 * (`InvoiceImportService`); maßgeblich bleibt deren Antwort. Wird nur bei geöffnetem Dialog gemountet.
 */
export function ImportInvoiceDialog({ open, onOpenChange, onImported }: Props) {
  const today = todayIsoDate();
  // Archivierte Kunden einschließen: Altrechnungen können an frühere Kunden gegangen sein
  const customers = useCustomers(true);
  const importInvoice = useImportInvoice();

  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [status, setStatus] = useState<ImportStatus>("paid");
  const [dueDate, setDueDate] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [totalText, setTotalText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateDates(): string | null {
    if (invoiceDate === "") return "Rechnungsdatum ist erforderlich";
    if (invoiceDate > today) return "Das Rechnungsdatum darf nicht in der Zukunft liegen";
    if (status === "open" && dueDate === "") return "Für offene Rechnungen ist das Fälligkeitsdatum erforderlich";
    if (dueDate !== "" && dueDate < invoiceDate) return "Fällig am darf nicht vor dem Rechnungsdatum liegen";
    if (dueDate !== "" && dueDate > getLatestDueDate(invoiceDate)) {
      return "Fällig am darf höchstens 365 Tage nach dem Rechnungsdatum liegen";
    }
    if (status === "paid" && paidAt === "") return "Für bezahlte Rechnungen ist das Zahlungsdatum erforderlich";
    if (status === "paid" && paidAt < invoiceDate) return "Bezahlt am darf nicht vor dem Rechnungsdatum liegen";
    if (status === "paid" && paidAt > today) return "Bezahlt am darf nicht in der Zukunft liegen";
    return null;
  }

  function validateFile(): string | null {
    if (file === null) return "Bitte das PDF der Rechnung auswählen";
    if (file.size === 0) return "Die PDF-Datei ist leer";
    if (file.size > MAX_IMPORT_PDF_BYTES) return "Die PDF-Datei darf höchstens 10 MiB groß sein";
    const isPdf = file.type === PDF_MIME_TYPE || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return "Nur PDF-Dateien sind erlaubt";
    return null;
  }

  function validate(): string | null {
    if (customerId === "") return "Bitte einen Kunden wählen";
    const dateError = validateDates();
    if (dateError !== null) return dateError;
    const numberError = validateImportInvoiceNumber(invoiceNumber.trim(), invoiceDate);
    if (numberError !== null) return numberError;
    const totalCents = parseEuroInput(totalText);
    if (totalCents === null || totalCents <= 0 || totalCents > MAX_IMPORT_TOTAL_CENTS) {
      return "Bitte einen positiven Rechnungsbetrag angeben";
    }
    return validateFile();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = validate();
    setError(message);
    const totalCents = parseEuroInput(totalText);
    if (message !== null || totalCents === null || file === null) return;

    const input: ImportInvoiceInput = {
      customerId,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      status,
      dueDate: toNullable(dueDate),
      paidAt: status === "paid" ? toNullable(paidAt) : null,
      serviceDate: toNullable(serviceDate),
      totalCents,
      file,
    };
    importInvoice.mutate(input, {
      onSuccess: (imported) => {
        toast.success(`Rechnung ${imported.invoiceNumber ?? ""} importiert`.trim());
        onOpenChange(false);
        onImported(imported);
      },
      onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
    });
  }

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        size="lg"
        title="Bestandsrechnung importieren"
        description="Eine bereits außerhalb erstellte Rechnung mit ihrem PDF übernehmen. Spätere Rechnungsnummern schließen daran an."
        onSubmit={handleSubmit}
        submitLabel="Importieren"
        isSubmitting={importInvoice.isPending}
      >
        {error !== null && (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="import-customer">Kunde</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger id="import-customer" className="sm:flex-1">
                <SelectValue placeholder={customers.isPending ? "Wird geladen" : "Kunde wählen"} />
              </SelectTrigger>
              <SelectContent>
                {(customers.data ?? []).map((customer) => (
                  <SelectItem key={customer.customerId} value={customer.customerId}>
                    {customer.archivedAt === null ? customer.displayName : `${customer.displayName} (archiviert)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => setIsCustomerDialogOpen(true)}>
              <UserPlus />
              Neu anlegen
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="import-number">Rechnungsnummer</Label>
            <Input
              id="import-number"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              placeholder="RE-2026-0001"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="import-date">Rechnungsdatum</Label>
            <Input
              id="import-date"
              type="date"
              value={invoiceDate}
              max={today}
              onChange={(event) => setInvoiceDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="import-total">Rechnungsbetrag (€)</Label>
            <Input
              id="import-total"
              inputMode="decimal"
              value={totalText}
              onChange={(event) => setTotalText(event.target.value)}
              placeholder="1.200,00"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="import-service-date">
              Leistungsdatum <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="import-service-date"
              type="date"
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Status</legend>
          <RadioGroup
            value={status}
            onValueChange={(value) => setStatus(value === "open" ? "open" : "paid")}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="paid" id="import-status-paid" />
              <Label htmlFor="import-status-paid" className="font-normal">
                Bezahlt
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="open" id="import-status-open" />
              <Label htmlFor="import-status-open" className="font-normal">
                Offen
              </Label>
            </div>
          </RadioGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="import-due-date">
                Fällig am{" "}
                {status === "paid" && <span className="font-normal text-muted-foreground">(optional)</span>}
              </Label>
              <Input
                id="import-due-date"
                type="date"
                value={dueDate}
                min={invoiceDate === "" ? undefined : invoiceDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            {status === "paid" && (
              <div className="space-y-2">
                <Label htmlFor="import-paid-at">Bezahlt am</Label>
                <Input
                  id="import-paid-at"
                  type="date"
                  value={paidAt}
                  min={invoiceDate === "" ? undefined : invoiceDate}
                  max={today}
                  onChange={(event) => setPaidAt(event.target.value)}
                />
              </div>
            )}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="import-file">PDF der Rechnung</Label>
          <Input
            id="import-file"
            type="file"
            accept={`${PDF_MIME_TYPE},.pdf`}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">Höchstens 10 MiB. Die Datei wird unverändert archiviert.</p>
        </div>
      </FormDialog>

      {/* Außerhalb des Formulars, damit dessen Submit nicht in den Import-Dialog durchschlägt */}
      {isCustomerDialogOpen && (
        <CustomerFormDialog customer={null} open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen} />
      )}
    </>
  );
}
