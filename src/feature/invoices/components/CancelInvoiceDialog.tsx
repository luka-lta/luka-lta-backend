import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { useCancelInvoice } from "@/api/invoices/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { formatCents } from "@/feature/business-documents/money.ts";
import type { Invoice } from "@/feature/invoices/schema/invoice.ts";

interface Props {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nach Erfolg mit der neuen Stornorechnung. */
  onCancelled: (cancellation: Invoice) => void;
}

/** Bestätigung für das Stornieren; erzeugt sofort eine festgeschriebene Stornorechnung. */
export function CancelInvoiceDialog({ invoice, open, onOpenChange, onCancelled }: Props) {
  const cancelInvoice = useCancelInvoice();
  const number = invoice.invoiceNumber ?? "";

  function handleConfirm() {
    cancelInvoice.mutate(invoice.invoiceId, {
      onSuccess: (cancellation) => {
        toast.success(`Stornorechnung ${cancellation.invoiceNumber ?? ""} erstellt`.trim());
        onOpenChange(false);
        onCancelled(cancellation);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirm}
      isLoading={cancelInvoice.isPending}
      destructive
      title={`Rechnung ${number} stornieren?`}
      description={
        <div className="space-y-2">
          <p>
            Es wird sofort eine neue Stornorechnung mit eigener Rechnungsnummer und PDF erzeugt und festgeschrieben.
            Sie hebt die Rechnung mit negativen Beträgen auf (Betrag {formatCents(-invoice.totalCents)}).
          </p>
          <p>
            Die Rechnung {number} gilt danach als storniert. Das lässt sich nicht rückgängig machen; Nummer und PDF der
            Stornorechnung sind endgültig.
          </p>
        </div>
      }
      confirmLabel="Endgültig stornieren"
    />
  );
}
