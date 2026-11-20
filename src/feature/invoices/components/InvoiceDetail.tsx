import { Link } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { BadgeCheck, Ban, Download, Lock, Pencil, Stamp, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { useDeleteInvoice, useFinalizeInvoice, useInvoice, useUnmarkInvoicePaid } from "@/api/invoices/hooks.ts";
import { getInvoicePdfPath } from "@/api/invoices/endpoints.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { useBusinessSettings } from "@/api/business-settings/hooks.ts";
import { formatIsoDate } from "@/lib/dateTimeUtils.ts";
import { DocumentStatusBadge } from "@/feature/business-documents/DocumentStatusBadge.tsx";
import { FinalizeHints } from "@/feature/business-documents/FinalizeHints.tsx";
import { getBusinessErrorMessage } from "@/feature/business-documents/businessErrors.ts";
import { getDocumentDateHint } from "@/feature/business-documents/finalizeGuards.ts";
import { MoneyText } from "@/feature/business-documents/MoneyText.tsx";
import { downloadPdf } from "@/feature/business-documents/downloadPdf.ts";
import { MarkPaidDialog } from "@/feature/invoices/components/MarkPaidDialog.tsx";
import { PdfPreview } from "@/feature/business-documents/PdfPreview.tsx";
import { CancelInvoiceDialog } from "@/feature/invoices/components/CancelInvoiceDialog.tsx";
import {
  getDeductionLabel,
  getInvoicePdfFileName,
  isServiceInfoMissing,
  KIND_LABELS,
  translateLockReason,
} from "@/feature/invoices/invoiceRules.ts";
import type { Invoice } from "@/feature/invoices/schema/invoice.ts";

interface Props {
  invoiceId: string;
  onBack: () => void;
  onEdit: (invoice: Invoice) => void;
  /** Nach Löschen eines Entwurfs. */
  onDeleted: () => void;
  /** Verknüpfte Rechnung öffnen (Anzahlung, Original eines Stornos, neue Stornorechnung). */
  onOpenInvoice: (invoiceId: string) => void;
}

type PendingAction = "finalize" | "delete" | "pay" | "unpay" | "cancel" | null;

function formatQuantity(quantity: string): string {
  return quantity.replace(".", ",");
}

function formatService(invoice: Invoice): string | null {
  if (invoice.serviceDate !== null) return formatIsoDate(invoice.serviceDate);
  if (invoice.servicePeriodStart !== null && invoice.servicePeriodEnd !== null) {
    return `${formatIsoDate(invoice.servicePeriodStart)} – ${formatIsoDate(invoice.servicePeriodEnd)}`;
  }
  return null;
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function InvoiceDetail({ invoiceId, onBack, onEdit, onDeleted, onOpenInvoice }: Props) {
  const invoiceQuery = useInvoice(invoiceId);
  const finalizeInvoice = useFinalizeInvoice();
  const deleteInvoice = useDeleteInvoice();
  const unmarkPaid = useUnmarkInvoicePaid();
  const businessSettings = useBusinessSettings();
  const [pending, setPending] = useState<PendingAction>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const invoice = invoiceQuery.data;

  if (invoiceQuery.error) {
    return (
      <ErrorState
        title="Rechnung konnte nicht geladen werden"
        error={invoiceQuery.error}
        onRetry={() => invoiceQuery.refetch()}
      />
    );
  }
  if (invoice === undefined) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Wird geladen">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const isDraft = invoice.status === "draft";
  const isServiceMissing = isDraft && isServiceInfoMissing(invoice);
  // Spiegelt die API-Prüfungen; Produktion liefert bei Ablehnung nur generische Texte
  const isSettingsMissing = businessSettings.data === null;
  const dateHint = isDraft ? getDocumentDateHint(invoice.invoiceDate) : null;
  const isFinalizeBlocked = invoice.isLocked || isServiceMissing || isSettingsMissing || dateHint !== null;
  const isCancellable =
    invoice.kind !== "cancellation" && (invoice.status === "open" || invoice.status === "paid");
  const service = formatService(invoice);
  const hasDeduction = invoice.depositDeductionCents !== 0;

  async function handleDownload() {
    if (invoice === undefined) return;
    setIsDownloading(true);
    try {
      await downloadPdf(getInvoicePdfPath(invoiceId), getInvoicePdfFileName(invoice));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsDownloading(false);
    }
  }

  function handleFinalize() {
    finalizeInvoice.mutate(invoiceId, {
      onSuccess: (finalized) => {
        toast.success(`Rechnung ${finalized.invoiceNumber ?? ""} festgeschrieben`.replace("  ", " "));
        setPending(null);
      },
      onError: (error) => toast.error(getBusinessErrorMessage(error, "finalize")),
    });
  }

  function handleDelete() {
    deleteInvoice.mutate(invoiceId, {
      onSuccess: () => {
        toast.success("Entwurf gelöscht");
        setPending(null);
        onDeleted();
      },
      onError: (error) => toast.error(getBusinessErrorMessage(error, "delete")),
    });
  }

  function handleUnpay() {
    unmarkPaid.mutate(invoiceId, {
      onSuccess: () => {
        toast.success("Zahlung zurückgenommen");
        setPending(null);
      },
      // 409 z. B., wenn eine festgeschriebene Schlussrechnung diese Anzahlung abzieht
      onError: (error) => toast.error(getBusinessErrorMessage(error, "unpay")),
    });
  }

  // Nur die zum Status passenden Aktionen anzeigen; Produktion liefert bei Fehlern nur generische Texte
  const actions = (
    <>
      <Button variant="outline" onClick={onBack}>
        Zur Liste
      </Button>
      <Button variant="outline" onClick={handleDownload} disabled={isDownloading || (!isDraft && !invoice.hasPdf)}>
        <Download />
        {isDraft ? "Vorschau-PDF" : "PDF herunterladen"}
      </Button>
      {isDraft && (
        <>
          <Button variant="outline" onClick={() => onEdit(invoice)}>
            <Pencil />
            Bearbeiten
          </Button>
          <Button variant="outline" onClick={() => setPending("delete")}>
            <Trash2 />
            Löschen
          </Button>
          <Button onClick={() => setPending("finalize")} disabled={isFinalizeBlocked}>
            <Stamp />
            Festschreiben
          </Button>
        </>
      )}
      {invoice.status === "open" && (
        <Button onClick={() => setPending("pay")}>
          <BadgeCheck />
          Als bezahlt markieren
        </Button>
      )}
      {invoice.status === "paid" && (
        <Button variant="outline" onClick={() => setPending("unpay")}>
          <Undo2 />
          Zahlung zurücknehmen
        </Button>
      )}
      {isCancellable && (
        <Button variant="outline" onClick={() => setPending("cancel")}>
          <Ban />
          Stornieren
        </Button>
      )}
    </>
  );

  const title = invoice.invoiceNumber ?? `${KIND_LABELS[invoice.kind]} (Entwurf)`;
  const previewTitle = invoice.invoiceNumber === null ? "Vorschau Entwurf" : `Vorschau ${invoice.invoiceNumber}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={invoice.customerName}
        meta={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={invoice.kind === "standard" ? "outline" : "secondary"}>{KIND_LABELS[invoice.kind]}</Badge>
            {invoice.isImported && <Badge variant="outline">Importiert</Badge>}
            <DocumentStatusBadge kind="invoice" status={invoice.status} isOverdue={invoice.isOverdue} />
          </div>
        }
        actions={actions}
      />

      <div className="2xl:grid 2xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] 2xl:gap-6">
        <div className="space-y-6">
          {isDraft && invoice.isLocked && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm"
            >
              <Lock className="size-4 shrink-0" aria-hidden />
              {translateLockReason(invoice.lockReason ?? "")}
            </p>
          )}
          {isServiceMissing && (
            <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
              Leistungsdatum fehlt: Vor dem Festschreiben ein Leistungsdatum oder einen Leistungszeitraum eintragen
              (Bearbeiten).
            </p>
          )}

          {isDraft && <FinalizeHints isSettingsMissing={isSettingsMissing} dateHint={dateHint} />}

          <dl className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-3">
            <Meta label="Rechnungsdatum">{formatIsoDate(invoice.invoiceDate)}</Meta>
            <Meta label={invoice.servicePeriodStart !== null ? "Leistungszeitraum" : "Leistungsdatum"}>
              {service ?? <span className="text-muted-foreground">–</span>}
            </Meta>
            {invoice.dueDate !== null && <Meta label="Fällig am">{formatIsoDate(invoice.dueDate)}</Meta>}
            {invoice.paidAt !== null && <Meta label="Bezahlt am">{formatIsoDate(invoice.paidAt)}</Meta>}
            {invoice.offerNumber !== null && <Meta label="Angebot">{invoice.offerNumber}</Meta>}
            {invoice.depositInvoiceId !== null && (
              <Meta label="Anzahlung">
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => onOpenInvoice(invoice.depositInvoiceId ?? "")}
                >
                  {invoice.depositInvoiceNumber ?? "Entwurf öffnen"}
                </Button>
              </Meta>
            )}
            {invoice.cancelsInvoiceId !== null && (
              <Meta label="Storno zu">
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => onOpenInvoice(invoice.cancelsInvoiceId ?? "")}
                >
                  {invoice.cancelsInvoiceNumber ?? "Rechnung öffnen"}
                </Button>
              </Meta>
            )}
          </dl>

          {invoice.introText !== null && <p className="whitespace-pre-line text-sm">{invoice.introText}</p>}

          {invoice.items.length === 0 ? (
            <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              Importierte Rechnung ohne Positionen, Details stehen im PDF.
            </p>
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Pos.</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="text-right">Menge</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead className="text-right">Einzelpreis</TableHead>
                    <TableHead className="text-right">Summe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.position}>
                      <TableCell>{item.position}</TableCell>
                      <TableCell className="whitespace-pre-line">{item.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatQuantity(item.quantity)}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">
                        <MoneyText cents={item.unitPriceCents} />
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyText cents={item.lineTotalCents} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <dl className="ml-auto grid w-full max-w-sm grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
            {hasDeduction && (
              <>
                <dt>Zwischensumme</dt>
                <dd className="text-right">
                  <MoneyText cents={invoice.subtotalCents} />
                </dd>
                <dt>{getDeductionLabel(invoice)}</dt>
                <dd className="text-right">
                  <MoneyText cents={-invoice.depositDeductionCents} />
                </dd>
              </>
            )}
            <dt className="font-semibold">{hasDeduction ? "Restbetrag" : "Gesamtbetrag"}</dt>
            <dd className="text-right font-semibold">
              <MoneyText cents={invoice.totalCents} />
            </dd>
          </dl>
          {isDraft && invoice.kind === "final" && (
            <p className="text-xs text-muted-foreground">
              Vorläufiger Abzug; maßgeblich ist der Stand der Anzahlung beim Festschreiben.
            </p>
          )}

          {invoice.closingText !== null && <p className="whitespace-pre-line text-sm">{invoice.closingText}</p>}

          <ConfirmDialog
            open={pending === "finalize"}
            onOpenChange={(open) => !open && setPending(null)}
            onConfirm={handleFinalize}
            isLoading={finalizeInvoice.isPending}
            disabled={isFinalizeBlocked}
            title="Rechnung festschreiben?"
            description={
              "Die Rechnung erhält jetzt ihre fortlaufende Rechnungsnummer und das PDF wird erzeugt. "
              + "Nummer und PDF sind danach endgültig: Die Rechnung kann nicht mehr bearbeitet oder gelöscht werden, "
              + "Korrekturen gehen nur noch per Storno."
            }
            confirmLabel="Endgültig festschreiben"
          />
          <ConfirmDialog
            open={pending === "delete"}
            onOpenChange={(open) => !open && setPending(null)}
            onConfirm={handleDelete}
            isLoading={deleteInvoice.isPending}
            destructive
            title="Entwurf löschen?"
            description="Der Entwurf wird endgültig gelöscht."
            confirmLabel="Löschen"
          />
          <ConfirmDialog
            open={pending === "unpay"}
            onOpenChange={(open) => !open && setPending(null)}
            onConfirm={handleUnpay}
            isLoading={unmarkPaid.isPending}
            title="Zahlung zurücknehmen?"
            description="Die Rechnung gilt danach wieder als offen, das Zahlungsdatum wird entfernt."
            confirmLabel="Zurücknehmen"
          />
          {pending === "pay" && (
            <MarkPaidDialog invoice={invoice} open onOpenChange={(open) => !open && setPending(null)} />
          )}
          {pending === "cancel" && (
            <CancelInvoiceDialog
              invoice={invoice}
              open
              onOpenChange={(open) => !open && setPending(null)}
              onCancelled={(cancellation) => onOpenInvoice(cancellation.invoiceId)}
            />
          )}
        </div>

        <aside className="mt-6 2xl:sticky 2xl:top-[4.5rem] 2xl:mt-0 2xl:self-start">
          <PdfPreview
            path={getInvoicePdfPath(invoiceId)}
            queryKey={["invoices", "pdf", invoiceId]}
            title={previewTitle}
            isFinal={!isDraft}
            isBlocked={isDraft && isSettingsMissing}
            blockedHint={
              <>
                Vorschau verfügbar, sobald die{" "}
                <Link to="/dashboard/business/settings" className="font-medium underline underline-offset-4">
                  Firmendaten
                </Link>{" "}
                hinterlegt sind.
              </>
            }
          />
        </aside>
      </div>
    </div>
  );
}
