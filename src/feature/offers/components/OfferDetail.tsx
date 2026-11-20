import { useState, type ReactNode } from "react";
import { Check, Copy, Download, FileText, Pencil, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import {
  useDeleteOffer,
  useDuplicateOffer,
  useOffer,
  useSendOffer,
  useSetOfferStatus,
} from "@/api/offers/hooks.ts";
import { getOfferPdfPath } from "@/api/offers/endpoints.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { formatIsoDate } from "@/lib/dateTimeUtils.ts";
import { DocumentStatusBadge } from "@/feature/business-documents/DocumentStatusBadge.tsx";
import { MoneyText } from "@/feature/business-documents/MoneyText.tsx";
import { downloadPdf } from "@/feature/business-documents/downloadPdf.ts";
import type { Offer } from "@/feature/offers/schema/offer.ts";

interface Props {
  offerId: string;
  onBack: () => void;
  onEdit: (offer: Offer) => void;
  /** Nach Löschen eines Entwurfs. */
  onDeleted: () => void;
  /** Nach Duplizieren: Detailansicht der Kopie öffnen. */
  onOpenOffer: (offerId: string) => void;
  /**
   * Slot für "Anzahlungsrechnung / Schlussrechnung / Rechnung" (Task 13). Wird nur bei angenommenen Angeboten
   * gerendert; ohne Angabe erscheinen deaktivierte Platzhalter-Buttons ("Folgt").
   */
  invoiceActions?: (offer: Offer) => ReactNode;
}

const PLACEHOLDER_LABELS = ["Anzahlungsrechnung", "Schlussrechnung", "Rechnung"];

function formatQuantity(quantity: string): string {
  return quantity.replace(".", ",");
}

type PendingAction = "send" | "delete" | "accept" | "reject" | null;

export function OfferDetail({ offerId, onBack, onEdit, onDeleted, onOpenOffer, invoiceActions }: Props) {
  const offerQuery = useOffer(offerId);
  const sendOffer = useSendOffer();
  const setStatus = useSetOfferStatus();
  const duplicateOffer = useDuplicateOffer();
  const deleteOffer = useDeleteOffer();
  const [pending, setPending] = useState<PendingAction>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const offer = offerQuery.data;

  if (offerQuery.error) {
    return <ErrorState title="Angebot konnte nicht geladen werden" error={offerQuery.error} onRetry={() => offerQuery.refetch()} />;
  }
  if (offer === undefined) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Wird geladen">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const isDraft = offer.status === "draft";
  const pdfFallbackName = offer.offerNumber === null ? "Angebot-Entwurf.pdf" : `${offer.offerNumber}.pdf`;

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await downloadPdf(getOfferPdfPath(offerId), pdfFallbackName);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsDownloading(false);
    }
  }

  function handleSend() {
    sendOffer.mutate(offerId, {
      onSuccess: (sent) => {
        toast.success(`Angebot ${sent.offerNumber ?? ""} versendet`.replace("  ", " "));
        setPending(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleDecision(status: "accepted" | "rejected") {
    setStatus.mutate(
      { offerId, status },
      {
        onSuccess: () => {
          toast.success(status === "accepted" ? "Als angenommen markiert" : "Als abgelehnt markiert");
          setPending(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function handleDuplicate() {
    duplicateOffer.mutate(offerId, {
      onSuccess: (copy) => {
        toast.success("Angebot dupliziert");
        onOpenOffer(copy.offerId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function handleDelete() {
    deleteOffer.mutate(offerId, {
      onSuccess: () => {
        toast.success("Entwurf gelöscht");
        setPending(null);
        onDeleted();
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function renderInvoiceSlot(current: Offer): ReactNode {
    if (current.status !== "accepted") return null;
    if (invoiceActions !== undefined) return invoiceActions(current);
    return PLACEHOLDER_LABELS.map((label) => (
      <Button key={label} variant="outline" disabled title="Folgt">
        <FileText />
        {label}
      </Button>
    ));
  }

  // Nur die zum Status passenden Aktionen anzeigen; die API lehnt alles andere ohnehin ab
  const actions = (
    <>
      <Button variant="outline" onClick={onBack}>
        Zur Liste
      </Button>
      <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
        <Download />
        {isDraft ? "Vorschau-PDF" : "PDF herunterladen"}
      </Button>
      <Button variant="outline" onClick={handleDuplicate} disabled={duplicateOffer.isPending}>
        <Copy />
        Duplizieren
      </Button>
      {isDraft && (
        <>
          <Button variant="outline" onClick={() => onEdit(offer)}>
            <Pencil />
            Bearbeiten
          </Button>
          <Button variant="outline" onClick={() => setPending("delete")}>
            <Trash2 />
            Löschen
          </Button>
          <Button onClick={() => setPending("send")}>
            <Send />
            Versenden (festschreiben)
          </Button>
        </>
      )}
      {offer.status === "sent" && (
        <>
          <Button variant="outline" onClick={() => setPending("reject")}>
            <X />
            Abgelehnt
          </Button>
          <Button onClick={() => setPending("accept")}>
            <Check />
            Angenommen
          </Button>
        </>
      )}
      {renderInvoiceSlot(offer)}
    </>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={offer.offerNumber ?? "Angebot (Entwurf)"}
        description={offer.customerName}
        meta={<DocumentStatusBadge kind="offer" status={offer.status} />}
        actions={actions}
      />

      <dl className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">Angebotsdatum</dt>
          <dd>{formatIsoDate(offer.offerDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Gültig bis</dt>
          <dd>{formatIsoDate(offer.validUntil)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Summe</dt>
          <dd className="font-semibold">
            <MoneyText cents={offer.totalCents} />
          </dd>
        </div>
      </dl>

      {offer.introText !== null && <p className="whitespace-pre-line text-sm">{offer.introText}</p>}

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
            {offer.items.map((item) => (
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

      {offer.closingText !== null && <p className="whitespace-pre-line text-sm">{offer.closingText}</p>}

      <ConfirmDialog
        open={pending === "send"}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={handleSend}
        isLoading={sendOffer.isPending}
        title="Angebot versenden und festschreiben?"
        description="Das Angebot erhält jetzt seine Nummer und das PDF wird erzeugt. Nummer und PDF sind danach endgültig, das Angebot kann nicht mehr bearbeitet oder gelöscht werden."
        confirmLabel="Festschreiben"
      />
      <ConfirmDialog
        open={pending === "delete"}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={handleDelete}
        isLoading={deleteOffer.isPending}
        destructive
        title="Entwurf löschen?"
        description="Der Entwurf wird endgültig gelöscht."
        confirmLabel="Löschen"
      />
      <ConfirmDialog
        open={pending === "accept"}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={() => handleDecision("accepted")}
        isLoading={setStatus.isPending}
        title="Angebot als angenommen markieren?"
        description="Danach können Rechnungen aus dem Angebot erstellt werden."
        confirmLabel="Angenommen"
      />
      <ConfirmDialog
        open={pending === "reject"}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={() => handleDecision("rejected")}
        isLoading={setStatus.isPending}
        destructive
        title="Angebot als abgelehnt markieren?"
        description="Der Status lässt sich danach nicht mehr ändern."
        confirmLabel="Abgelehnt"
      />
    </div>
  );
}
