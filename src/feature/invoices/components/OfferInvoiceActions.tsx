import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { CreateFromOfferDialog } from "@/feature/invoices/components/CreateFromOfferDialog.tsx";
import type { Offer } from "@/feature/offers/schema/offer.ts";

/** Ziel der Rechnungsseite; die Detailansicht öffnet sich über den Router-State `{ invoiceId }`. */
const INVOICES_PATH = "/dashboard/business/invoices";

interface Props {
  offer: Offer;
}

/** Rechnungsaktionen eines angenommenen Angebots (Slot `invoiceActions` in `OfferDetail`). */
export function OfferInvoiceActions({ offer }: Props) {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function openInvoice(invoiceId: string) {
    navigate(INVOICES_PATH, { state: { invoiceId } });
  }

  return (
    <>
      {offer.depositInvoiceId !== null && (
        <Button variant="outline" onClick={() => openInvoice(offer.depositInvoiceId ?? "")}>
          <Receipt />
          Anzahlung öffnen
        </Button>
      )}
      {offer.finalInvoiceId !== null && (
        <Button variant="outline" onClick={() => openInvoice(offer.finalInvoiceId ?? "")}>
          <Receipt />
          Schlussrechnung öffnen
        </Button>
      )}
      <Button onClick={() => setIsDialogOpen(true)}>
        <FilePlus2 />
        Rechnung erstellen
      </Button>
      {isDialogOpen && (
        <CreateFromOfferDialog
          offer={offer}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onCreated={(invoice) => openInvoice(invoice.invoiceId)}
        />
      )}
    </>
  );
}
