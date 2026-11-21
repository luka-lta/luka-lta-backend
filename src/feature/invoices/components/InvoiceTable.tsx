import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { DocumentStatusBadge } from "@/feature/business-documents/DocumentStatusBadge.tsx";
import { MoneyText } from "@/feature/business-documents/MoneyText.tsx";
import { formatIsoDate } from "@/lib/dateTimeUtils.ts";
import { KIND_LABELS } from "@/feature/invoices/invoiceRules.ts";
import type { Invoice } from "@/feature/invoices/schema/invoice.ts";

interface Props {
  invoices: Invoice[];
  onOpen: (invoice: Invoice) => void;
}

/** Platzhalter in der Nummernspalte, solange ein Entwurf noch keine Nummer hat. */
const NO_NUMBER = "Entwurf";

export function InvoiceTable({ invoices, onOpen }: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nummer</TableHead>
            <TableHead>Art</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead>Fällig</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Betrag</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Aktionen</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoiceId}>
              <TableCell className="font-medium">{invoice.invoiceNumber ?? NO_NUMBER}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1">
                  <Badge variant={invoice.kind === "standard" ? "outline" : "secondary"}>
                    {KIND_LABELS[invoice.kind]}
                  </Badge>
                  {invoice.isImported && <Badge variant="outline">Importiert</Badge>}
                </div>
              </TableCell>
              <TableCell>{invoice.customerName}</TableCell>
              <TableCell>{formatIsoDate(invoice.invoiceDate)}</TableCell>
              <TableCell>{invoice.dueDate === null ? "–" : formatIsoDate(invoice.dueDate)}</TableCell>
              <TableCell>
                <DocumentStatusBadge kind="invoice" status={invoice.status} isOverdue={invoice.isOverdue} />
              </TableCell>
              <TableCell className="text-right">
                <MoneyText cents={invoice.totalCents} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpen(invoice)}
                  aria-label={`Rechnung ${invoice.invoiceNumber ?? NO_NUMBER} für ${invoice.customerName} öffnen`}
                >
                  Öffnen
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
