import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { FileUp, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { useCustomers } from "@/api/customers/hooks.ts";
import { useInvoices } from "@/api/invoices/hooks.ts";
import { MoneyText } from "@/feature/business-documents/MoneyText.tsx";
import { InvoiceTable } from "@/feature/invoices/components/InvoiceTable.tsx";
import { InvoiceEditor } from "@/feature/invoices/components/InvoiceEditor.tsx";
import { InvoiceDetail } from "@/feature/invoices/components/InvoiceDetail.tsx";
import { ImportInvoiceDialog } from "@/feature/invoices/components/ImportInvoiceDialog.tsx";
import {
  invoiceStatusSchema,
  type Invoice,
  type InvoiceFilters,
  type InvoiceStatus,
} from "@/feature/invoices/schema/invoice.ts";

/** Anzahl der Skeleton-Zeilen im Ladezustand. */
const SKELETON_ROWS = 5;
/** Wie viele Jahre (inkl. aktuellem) der Jahresfilter anbietet. */
const YEAR_FILTER_COUNT = 5;
/** Auswahlwert für "kein Filter" (Radix-Select erlaubt keinen leeren Wert). */
const ALL = "all";
/** Zusätzlicher Statusfilter: offene Rechnungen nach Fälligkeit (API-Parameter overdue=1). */
const OVERDUE = "overdue";

const STATUS_FILTER_OPTIONS: { value: InvoiceStatus | typeof OVERDUE; label: string }[] = [
  { value: "draft", label: "Entwurf" },
  { value: "open", label: "Offen" },
  { value: OVERDUE, label: "Überfällig" },
  { value: "paid", label: "Bezahlt" },
  { value: "cancelled", label: "Storniert" },
  { value: "issued", label: "Storno (gebucht)" },
];

/** Router-State beim Sprung aus einem Angebot: `{ invoiceId }` öffnet direkt die Detailansicht. */
const navigationStateSchema = z.object({ invoiceId: z.string() });

type View =
  | { kind: "list" }
  | { kind: "detail"; invoiceId: string }
  | { kind: "editor"; invoice: Invoice | null };

export default function InvoicesFeature() {
  const location = useLocation();
  const [view, setView] = useState<View>(() => {
    const state = navigationStateSchema.safeParse(location.state);
    return state.success ? { kind: "detail", invoiceId: state.data.invoiceId } : { kind: "list" };
  });
  const navigate = useNavigate();
  const hasNavigationState = location.state !== null && location.state !== undefined;

  // Router-State nur einmal auswerten, sonst öffnet ein Neuladen wieder dieselbe Rechnung
  useEffect(() => {
    if (hasNavigationState) navigate(location.pathname, { replace: true, state: null });
  }, [hasNavigationState, location.pathname, navigate]);

  return (
    <PageContainer title="Rechnungen">
      {view.kind === "list" && (
        <InvoiceList
          onCreate={() => setView({ kind: "editor", invoice: null })}
          onOpen={(invoiceId) => setView({ kind: "detail", invoiceId })}
        />
      )}
      {view.kind === "detail" && (
        <InvoiceDetail
          key={view.invoiceId}
          invoiceId={view.invoiceId}
          onBack={() => setView({ kind: "list" })}
          onEdit={(invoice) => setView({ kind: "editor", invoice })}
          onDeleted={() => setView({ kind: "list" })}
          onOpenInvoice={(invoiceId) => setView({ kind: "detail", invoiceId })}
        />
      )}
      {view.kind === "editor" && (
        <InvoiceEditor
          invoice={view.invoice}
          onCancel={() =>
            setView(view.invoice === null ? { kind: "list" } : { kind: "detail", invoiceId: view.invoice.invoiceId })
          }
          onSaved={(saved) => setView({ kind: "detail", invoiceId: saved.invoiceId })}
        />
      )}
    </PageContainer>
  );
}

interface InvoiceListProps {
  onCreate: () => void;
  onOpen: (invoiceId: string) => void;
}

function InvoiceList({ onCreate, onOpen }: InvoiceListProps) {
  const [status, setStatus] = useState(ALL);
  const [customerId, setCustomerId] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filters = useMemo<InvoiceFilters>(() => {
    const parsedStatus = invoiceStatusSchema.safeParse(status);
    return {
      status: parsedStatus.success ? parsedStatus.data : undefined,
      overdue: status === OVERDUE ? 1 : undefined,
      customerId: customerId === ALL ? undefined : customerId,
      year: year === ALL ? undefined : Number(year),
    };
  }, [status, customerId, year]);
  const isFiltered = status !== ALL || customerId !== ALL || year !== ALL;

  const invoices = useInvoices(filters);
  // Archivierte Kunden haben ggf. noch Rechnungen und müssen filterbar bleiben
  const customers = useCustomers(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEAR_FILTER_COUNT }, (_, index) => currentYear - index);
  // Summe der offenen Rechnungen innerhalb der aktuellen Filter
  const openSumCents = (invoices.data ?? [])
    .filter((invoice) => invoice.status === "open")
    .reduce((sum, invoice) => sum + invoice.totalCents, 0);

  function renderContent() {
    if (invoices.error) {
      return (
        <ErrorState
          title="Rechnungen konnten nicht geladen werden"
          error={invoices.error}
          onRetry={() => invoices.refetch()}
        />
      );
    }
    if (invoices.isPending) {
      return (
        <div className="space-y-2" aria-busy="true" aria-label="Wird geladen">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      );
    }
    if (invoices.data.length === 0) {
      return (
        <EmptyState
          icon={Receipt}
          title={isFiltered ? "Keine Treffer" : "Noch keine Rechnungen"}
          description={
            isFiltered
              ? "Mit diesen Filtern gibt es keine Rechnung."
              : "Lege eine Rechnung an, erstelle sie aus einem angenommenen Angebot "
                + "oder importiere eine Bestandsrechnung."
          }
          action={
            isFiltered ? undefined : (
              <Button variant="outline" size="sm" onClick={onCreate}>
                Rechnung anlegen
              </Button>
            )
          }
        />
      );
    }
    return <InvoiceTable invoices={invoices.data} onOpen={(invoice) => onOpen(invoice.invoiceId)} />;
  }

  return (
    <>
      <PageHeader
        title="Rechnungen"
        description="Rechnungen erstellen, festschreiben, Zahlungen erfassen und stornieren."
        actions={
          <>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <FileUp />
              Bestandsrechnung importieren
            </Button>
            <Button onClick={onCreate}>
              <Plus />
              Rechnung anlegen
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="invoices-filter-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="invoices-filter-status" className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Alle</SelectItem>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invoices-filter-customer">Kunde</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger id="invoices-filter-customer" className="sm:w-56">
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
          <Label htmlFor="invoices-filter-year">Jahr</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="invoices-filter-year" className="sm:w-32">
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
        {invoices.data !== undefined && (
          <p className="text-sm sm:ml-auto sm:pb-2">
            Summe offen: <MoneyText cents={openSumCents} className="font-semibold" />
          </p>
        )}
      </div>

      {renderContent()}

      {isImportOpen && (
        <ImportInvoiceDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          onImported={(invoice) => onOpen(invoice.invoiceId)}
        />
      )}
    </>
  );
}
