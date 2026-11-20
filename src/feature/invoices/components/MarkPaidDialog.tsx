import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useMarkInvoicePaid } from "@/api/invoices/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { formatIsoDate, todayIsoDate } from "@/lib/dateTimeUtils.ts";
import type { Invoice } from "@/feature/invoices/schema/invoice.ts";

interface Props {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Zahlungseingang erfassen (open → paid). Wird nur bei geöffnetem Dialog gemountet. */
export function MarkPaidDialog({ invoice, open, onOpenChange }: Props) {
  const today = todayIsoDate();
  const markPaid = useMarkInvoicePaid();
  const [paidAt, setPaidAt] = useState(today);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (paidAt === "") return "Bitte das Zahlungsdatum angeben";
    if (paidAt > today) return "Das Zahlungsdatum darf nicht in der Zukunft liegen";
    if (paidAt < invoice.invoiceDate) {
      return `Das Zahlungsdatum darf nicht vor dem Rechnungsdatum (${formatIsoDate(invoice.invoiceDate)}) liegen`;
    }
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = validate();
    setError(message);
    if (message !== null) return;

    markPaid.mutate(
      { invoiceId: invoice.invoiceId, paidAt },
      {
        onSuccess: () => {
          toast.success("Zahlung erfasst");
          onOpenChange(false);
        },
        onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
      },
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Als bezahlt markieren"
      description={`Rechnung ${invoice.invoiceNumber ?? ""}`.trim()}
      onSubmit={handleSubmit}
      submitLabel="Zahlung erfassen"
      isSubmitting={markPaid.isPending}
    >
      {error !== null && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="invoice-paid-at">Bezahlt am</Label>
        <Input
          id="invoice-paid-at"
          type="date"
          value={paidAt}
          min={invoice.invoiceDate}
          max={today}
          onChange={(event) => setPaidAt(event.target.value)}
        />
      </div>
    </FormDialog>
  );
}
