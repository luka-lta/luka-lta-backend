import { Archive, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import type { Customer } from "@/feature/customers/schema/customer.ts";

interface Props {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onArchive: (customer: Customer) => void;
}

export function CustomerTable({ customers, onEdit, onArchive }: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Ort</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Aktionen</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const isArchived = customer.archivedAt !== null;
            return (
              <TableRow key={customer.customerId} className={isArchived ? "text-muted-foreground" : undefined}>
                <TableCell className="font-medium">
                  {customer.displayName}
                  {isArchived && (
                    <Badge variant="secondary" className="ml-2">
                      Archiviert
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {customer.postalCode} {customer.city}
                </TableCell>
                <TableCell>{customer.email ?? "–"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(customer)}
                    aria-label={`${customer.displayName} bearbeiten`}
                  >
                    <Pencil />
                  </Button>
                  {!isArchived && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onArchive(customer)}
                      aria-label={`${customer.displayName} archivieren`}
                    >
                      <Archive />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
