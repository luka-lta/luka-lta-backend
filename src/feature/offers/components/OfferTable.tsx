import { Button } from "@/components/ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { DocumentStatusBadge } from "@/feature/business-documents/DocumentStatusBadge.tsx";
import { MoneyText } from "@/feature/business-documents/MoneyText.tsx";
import { formatIsoDate } from "@/lib/dateTimeUtils.ts";
import type { Offer } from "@/feature/offers/schema/offer.ts";

interface Props {
  offers: Offer[];
  onOpen: (offer: Offer) => void;
}

/** Platzhalter in der Nummernspalte, solange ein Entwurf noch keine Nummer hat. */
const NO_NUMBER = "Entwurf";

export function OfferTable({ offers, onOpen }: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nummer</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead>Gültig bis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Summe</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Aktionen</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.offerId}>
              <TableCell className="font-medium">{offer.offerNumber ?? NO_NUMBER}</TableCell>
              <TableCell>{offer.customerName}</TableCell>
              <TableCell>{formatIsoDate(offer.offerDate)}</TableCell>
              <TableCell>{formatIsoDate(offer.validUntil)}</TableCell>
              <TableCell>
                <DocumentStatusBadge kind="offer" status={offer.status} />
              </TableCell>
              <TableCell className="text-right">
                <MoneyText cents={offer.totalCents} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpen(offer)}
                  aria-label={`Angebot ${offer.offerNumber ?? NO_NUMBER} für ${offer.customerName} öffnen`}
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
