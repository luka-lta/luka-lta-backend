import { useMemo, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { useCustomers } from "@/api/customers/hooks.ts";
import { useOffers } from "@/api/offers/hooks.ts";
import { OfferTable } from "@/feature/offers/components/OfferTable.tsx";
import { OfferEditor } from "@/feature/offers/components/OfferEditor.tsx";
import { OfferDetail } from "@/feature/offers/components/OfferDetail.tsx";
import { OfferInvoiceActions } from "@/feature/invoices/components/OfferInvoiceActions.tsx";
import { offerStatusSchema, type Offer, type OfferFilters } from "@/feature/offers/schema/offer.ts";

/** Anzahl der Skeleton-Zeilen im Ladezustand. */
const SKELETON_ROWS = 5;
/** Wie viele Jahre (inkl. aktuellem) der Jahresfilter anbietet. */
const YEAR_FILTER_COUNT = 5;
/** Auswahlwert für "kein Filter" (Radix-Select erlaubt keinen leeren Wert). */
const ALL = "all";

const STATUS_LABELS: Record<Offer["status"], string> = {
  draft: "Entwurf",
  sent: "Versendet",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
};

type View =
  | { kind: "list" }
  | { kind: "detail"; offerId: string }
  | { kind: "editor"; offer: Offer | null };

export default function OffersFeature() {
  const [view, setView] = useState<View>({ kind: "list" });

  return (
    <PageContainer title="Angebote">
      {view.kind === "list" && (
        <OfferList
          onCreate={() => setView({ kind: "editor", offer: null })}
          onOpen={(offer) => setView({ kind: "detail", offerId: offer.offerId })}
        />
      )}
      {view.kind === "detail" && (
        <OfferDetail
          key={view.offerId}
          offerId={view.offerId}
          onBack={() => setView({ kind: "list" })}
          onEdit={(offer) => setView({ kind: "editor", offer })}
          onDeleted={() => setView({ kind: "list" })}
          onOpenOffer={(offerId) => setView({ kind: "detail", offerId })}
          invoiceActions={(offer) => <OfferInvoiceActions offer={offer} />}
        />
      )}
      {view.kind === "editor" && (
        <OfferEditor
          offer={view.offer}
          onCancel={() =>
            setView(view.offer === null ? { kind: "list" } : { kind: "detail", offerId: view.offer.offerId })
          }
          onSaved={(saved) => setView({ kind: "detail", offerId: saved.offerId })}
        />
      )}
    </PageContainer>
  );
}

interface OfferListProps {
  onCreate: () => void;
  onOpen: (offer: Offer) => void;
}

function OfferList({ onCreate, onOpen }: OfferListProps) {
  const [status, setStatus] = useState(ALL);
  const [customerId, setCustomerId] = useState(ALL);
  const [year, setYear] = useState(ALL);

  const filters = useMemo<OfferFilters>(() => {
    const parsedStatus = offerStatusSchema.safeParse(status);
    return {
      status: parsedStatus.success ? parsedStatus.data : undefined,
      customerId: customerId === ALL ? undefined : customerId,
      year: year === ALL ? undefined : Number(year),
    };
  }, [status, customerId, year]);
  const isFiltered = status !== ALL || customerId !== ALL || year !== ALL;

  const offers = useOffers(filters);
  // Archivierte Kunden haben ggf. noch Angebote und müssen filterbar bleiben
  const customers = useCustomers(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEAR_FILTER_COUNT }, (_, index) => currentYear - index);

  function renderContent() {
    if (offers.error) {
      return (
        <ErrorState
          title="Angebote konnten nicht geladen werden"
          error={offers.error}
          onRetry={() => offers.refetch()}
        />
      );
    }
    if (offers.isPending) {
      return (
        <div className="space-y-2" aria-busy="true" aria-label="Wird geladen">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      );
    }
    if (offers.data.length === 0) {
      return (
        <EmptyState
          icon={FileText}
          title={isFiltered ? "Keine Treffer" : "Noch keine Angebote"}
          description={
            isFiltered ? "Mit diesen Filtern gibt es kein Angebot." : "Lege das erste Angebot für einen Kunden an."
          }
          action={
            isFiltered ? undefined : (
              <Button variant="outline" size="sm" onClick={onCreate}>
                Angebot anlegen
              </Button>
            )
          }
        />
      );
    }
    return <OfferTable offers={offers.data} onOpen={onOpen} />;
  }

  return (
    <>
      <PageHeader
        title="Angebote"
        description="Angebote erstellen, versenden und nachverfolgen."
        actions={
          <Button onClick={onCreate}>
            <Plus />
            Angebot anlegen
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="offers-filter-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="offers-filter-status" className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Alle</SelectItem>
              {offerStatusSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="offers-filter-customer">Kunde</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger id="offers-filter-customer" className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Alle</SelectItem>
              {(customers.data ?? []).map((customer) => (
                <SelectItem key={customer.customerId} value={customer.customerId}>
                  {customer.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="offers-filter-year">Jahr</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="offers-filter-year" className="sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Alle</SelectItem>
              {years.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderContent()}
    </>
  );
}
