import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { useArchiveCustomer, useCustomers } from "@/api/customers/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { CustomerTable } from "@/feature/customers/components/CustomerTable.tsx";
import { CustomerFormDialog } from "@/feature/customers/components/CustomerFormDialog.tsx";
import type { Customer } from "@/feature/customers/schema/customer.ts";

/** Anzahl der Skeleton-Zeilen im Ladezustand. */
const SKELETON_ROWS = 5;

function matchesSearch(customer: Customer, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (needle === "") return true;
  return [customer.displayName, customer.city, customer.email ?? ""].some((value) =>
    value.toLowerCase().includes(needle),
  );
}

export default function CustomersFeature() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [archiving, setArchiving] = useState<Customer | null>(null);

  const customers = useCustomers(includeArchived);
  const archiveCustomer = useArchiveCustomer();

  const visibleCustomers = useMemo(
    () => (customers.data ?? []).filter((customer) => matchesSearch(customer, search)),
    [customers.data, search],
  );

  function handleArchive() {
    if (archiving === null) return;
    archiveCustomer.mutate(archiving.customerId, {
      onSuccess: () => {
        toast.success("Kunde archiviert");
        setArchiving(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function renderContent() {
    if (customers.error) {
      return (
        <ErrorState
          title="Kunden konnten nicht geladen werden"
          error={customers.error}
          onRetry={() => customers.refetch()}
        />
      );
    }
    if (customers.isPending) {
      return (
        <div className="space-y-2" aria-busy="true" aria-label="Wird geladen">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      );
    }
    if (customers.data.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title="Noch keine Kunden"
          description="Kunden werden für Angebote und Rechnungen benötigt."
          action={
            <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
              Kunde anlegen
            </Button>
          }
        />
      );
    }
    if (visibleCustomers.length === 0) {
      return <EmptyState icon={Users} title="Keine Treffer" description="Die Suche ergibt keinen Kunden." />;
    }
    return <CustomerTable customers={visibleCustomers} onEdit={setEditing} onArchive={setArchiving} />;
  }

  return (
    <PageContainer title="Kunden">
      <PageHeader
        title="Kunden"
        description="Empfänger für Angebote und Rechnungen."
        actions={
          <Button onClick={() => setIsCreating(true)}>
            <Plus />
            Kunde anlegen
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Suche nach Name, Ort oder E-Mail"
          aria-label="Kunden durchsuchen"
          className="sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Switch id="customers-archived" checked={includeArchived} onCheckedChange={setIncludeArchived} />
          <Label htmlFor="customers-archived">Archivierte anzeigen</Label>
        </div>
      </div>

      {renderContent()}

      {isCreating && <CustomerFormDialog customer={null} open onOpenChange={setIsCreating} />}
      {editing !== null && (
        <CustomerFormDialog
          key={editing.customerId}
          customer={editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(open) => !open && setArchiving(null)}
        onConfirm={handleArchive}
        isLoading={archiveCustomer.isPending}
        destructive
        title="Kunde archivieren?"
        description={
          <>
            <span className="font-medium text-foreground">{archiving?.displayName}</span> kann danach nicht mehr für
            neue Angebote und Rechnungen gewählt werden. Bestehende Belege bleiben unverändert.
          </>
        }
        confirmLabel="Archivieren"
      />
    </PageContainer>
  );
}
