import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { useCreateInvoiceFromOffer } from "@/api/invoices/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { formatCents, parseEuroInput } from "@/feature/business-documents/money.ts";
import { MoneyText } from "@/feature/business-documents/MoneyText.tsx";
import {
  applyPercentThousandths,
  getAllowedOfferInvoiceKinds,
  parsePercentThousandths,
  thousandthsToPercent,
  type OfferInvoiceKind,
} from "@/feature/invoices/invoiceRules.ts";
import type { CreateFromOfferInput, Invoice } from "@/feature/invoices/schema/invoice.ts";
import type { Offer } from "@/feature/offers/schema/offer.ts";

type DepositMode = "amount" | "percent";

interface Props {
  offer: Offer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (invoice: Invoice) => void;
}

const KIND_OPTIONS: { kind: OfferInvoiceKind; label: string; description: string }[] = [
  {
    kind: "deposit",
    label: "Anzahlungsrechnung",
    description: "Teilbetrag vorab; wird von der Schlussrechnung abgezogen.",
  },
  {
    kind: "final",
    label: "Schlussrechnung",
    description: "Alle Positionen des Angebots abzüglich einer bezahlten Anzahlung.",
  },
  { kind: "standard", label: "Rechnung", description: "Normale Rechnung mit allen Positionen des Angebots." },
];

/** Rechnungsentwurf aus einem angenommenen Angebot. Wird nur bei geöffnetem Dialog gemountet. */
export function CreateFromOfferDialog({ offer, open, onOpenChange, onCreated }: Props) {
  const allowedKinds = getAllowedOfferInvoiceKinds(offer);
  const createFromOffer = useCreateInvoiceFromOffer();
  const [kind, setKind] = useState<OfferInvoiceKind>(allowedKinds[0]);
  const [depositMode, setDepositMode] = useState<DepositMode>("percent");
  const [amountText, setAmountText] = useState("");
  const [percentText, setPercentText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amountCents = parseEuroInput(amountText);
  const percentThousandths = parsePercentThousandths(percentText);
  const depositCents = calculateDepositCents();

  /** Live-Betrag; bei Prozent gerundet wie in der API. */
  function calculateDepositCents(): number | null {
    if (depositMode === "amount") return amountCents;
    if (percentThousandths === null) return null;
    return applyPercentThousandths(offer.totalCents, percentThousandths);
  }

  function buildInput(): CreateFromOfferInput | string {
    if (kind !== "deposit") return { kind };
    if (depositMode === "percent" && percentThousandths === null) {
      return "Prozentsatz muss größer 0 und kleiner 100 sein (höchstens 3 Nachkommastellen)";
    }
    if (depositMode === "amount" && amountCents === null) return "Bitte einen gültigen Betrag angeben";
    if (depositCents === null || depositCents <= 0 || depositCents >= offer.totalCents) {
      return `Die Anzahlung muss größer 0 und kleiner als die Angebotssumme (${formatCents(offer.totalCents)}) sein`;
    }
    if (depositMode === "percent" && percentThousandths !== null) {
      return { kind, percent: thousandthsToPercent(percentThousandths) };
    }
    return { kind, amountCents: depositCents };
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input = buildInput();
    if (typeof input === "string") {
      setError(input);
      return;
    }
    setError(null);
    createFromOffer.mutate(
      { offerId: offer.offerId, data: input },
      {
        onSuccess: (invoice) => {
          toast.success("Rechnungsentwurf angelegt");
          onOpenChange(false);
          onCreated(invoice);
        },
        onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
      },
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rechnung aus Angebot erstellen"
      description={`${offer.offerNumber ?? "Angebot"} · ${offer.customerName} · ${formatCents(offer.totalCents)}`}
      onSubmit={handleSubmit}
      submitLabel="Entwurf anlegen"
      isSubmitting={createFromOffer.isPending}
    >
      {error !== null && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Art</legend>
        <RadioGroup
          value={kind}
          onValueChange={(value) => {
            const next = allowedKinds.find((option) => option === value);
            if (next !== undefined) setKind(next);
          }}
        >
          {KIND_OPTIONS.filter((option) => allowedKinds.includes(option.kind)).map((option) => (
            <div key={option.kind} className="flex items-start gap-2">
              <RadioGroupItem value={option.kind} id={`offer-invoice-kind-${option.kind}`} className="mt-0.5" />
              <Label htmlFor={`offer-invoice-kind-${option.kind}`} className="grid gap-0.5 font-normal">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      {kind === "deposit" && (
        <fieldset className="space-y-3 rounded-xl border p-4">
          <legend className="px-1 text-sm font-medium">Anzahlung</legend>
          <RadioGroup
            value={depositMode}
            onValueChange={(value) => setDepositMode(value === "amount" ? "amount" : "percent")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="percent" id="deposit-mode-percent" />
              <Label htmlFor="deposit-mode-percent" className="font-normal">
                Prozent
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="amount" id="deposit-mode-amount" />
              <Label htmlFor="deposit-mode-amount" className="font-normal">
                Betrag (€)
              </Label>
            </div>
          </RadioGroup>
          {depositMode === "percent" && (
            <div className="space-y-2">
              <Label htmlFor="deposit-percent">Prozent der Angebotssumme</Label>
              <Input
                id="deposit-percent"
                inputMode="decimal"
                value={percentText}
                onChange={(event) => setPercentText(event.target.value)}
                placeholder="30"
                autoComplete="off"
              />
            </div>
          )}
          {depositMode === "amount" && (
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Betrag</Label>
              <Input
                id="deposit-amount"
                inputMode="decimal"
                value={amountText}
                onChange={(event) => setAmountText(event.target.value)}
                placeholder="400,00"
                autoComplete="off"
              />
            </div>
          )}
          <p className="text-sm" aria-live="polite">
            Anzahlungsbetrag:{" "}
            {depositCents === null ? (
              <span className="text-muted-foreground">–</span>
            ) : (
              <MoneyText cents={depositCents} />
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Vor dem Festschreiben muss im Entwurf noch ein Leistungsdatum oder -zeitraum eingetragen werden.
          </p>
        </fieldset>
      )}
    </FormDialog>
  );
}
