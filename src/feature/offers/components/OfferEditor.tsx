import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { PageHeader } from "@/components/layout/page.tsx";
import { useCustomers } from "@/api/customers/hooks.ts";
import { useCreateOffer, useUpdateOffer } from "@/api/offers/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { addDaysToIsoDate, todayIsoDate } from "@/lib/dateTimeUtils.ts";
import { LineItemsEditor } from "@/feature/business-documents/LineItemsEditor.tsx";
import { EMPTY_LINE_ITEM, validateLineItems, type LineItemInput } from "@/feature/business-documents/lineItems.ts";
import type { Offer, OfferInput } from "@/feature/offers/schema/offer.ts";

/** Standard-Gültigkeit eines Angebots in Tagen (wie in der API). */
const DEFAULT_VALIDITY_DAYS = 30;
/** Länge laut API für Einleitungs- und Schlusstext. */
const MAX_TEXT_LENGTH = 10000;

interface Props {
  /** null = neues Angebot anlegen; sonst Entwurf bearbeiten. */
  offer: Offer | null;
  onCancel: () => void;
  /** Wird nach erfolgreichem Speichern mit dem gespeicherten Angebot aufgerufen. */
  onSaved: (offer: Offer) => void;
}

function toLineItemInputs(offer: Offer | null): LineItemInput[] {
  if (offer === null) return [{ ...EMPTY_LINE_ITEM }];
  return offer.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unitPriceCents: item.unitPriceCents,
  }));
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Anlegen/Bearbeiten eines Entwurfs. Wird nur bei Bedarf gemountet (frischer Formularzustand). */
export function OfferEditor({ offer, onCancel, onSaved }: Props) {
  const today = todayIsoDate();
  const customers = useCustomers(false);
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();

  const [customerId, setCustomerId] = useState(offer?.customerId ?? "");
  const [offerDate, setOfferDate] = useState(offer?.offerDate ?? today);
  const [validUntil, setValidUntil] = useState(offer?.validUntil ?? addDaysToIsoDate(today, DEFAULT_VALIDITY_DAYS));
  const [introText, setIntroText] = useState(offer?.introText ?? "");
  const [closingText, setClosingText] = useState(offer?.closingText ?? "");
  const [items, setItems] = useState<LineItemInput[]>(() => toLineItemInputs(offer));
  const [areItemsValid, setAreItemsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditing = offer !== null;
  const isSaving = createOffer.isPending || updateOffer.isPending;

  // Nur aktive Kunden; der Kunde eines bestehenden Entwurfs bleibt auswählbar, auch wenn er inzwischen archiviert ist
  const customerOptions = (customers.data ?? []).map((customer) => ({
    id: customer.customerId,
    name: customer.displayName,
  }));
  if (offer !== null && !customerOptions.some((option) => option.id === offer.customerId)) {
    customerOptions.push({ id: offer.customerId, name: offer.customerName });
  }

  function validate(): string | null {
    if (customerId === "") return "Bitte einen Kunden wählen";
    if (offerDate === "" || validUntil === "") return "Angebotsdatum und Gültig-bis-Datum sind erforderlich";
    if (validUntil < offerDate) return "Gültig bis darf nicht vor dem Angebotsdatum liegen";
    if (introText.length > MAX_TEXT_LENGTH || closingText.length > MAX_TEXT_LENGTH) {
      return `Texte dürfen höchstens ${MAX_TEXT_LENGTH} Zeichen lang sein`;
    }
    if (!areItemsValid) return "Bitte ungültige Preise oder Mengen in den Positionen korrigieren";
    return validateLineItems(items);
  }

  function buildInput(): OfferInput {
    const input: OfferInput = {
      customerId,
      offerDate,
      validUntil,
      introText: toNullable(introText),
      items: items.map((item) => ({ ...item, description: item.description.trim(), unit: item.unit.trim() })),
    };
    // Leer beim Anlegen = Standardtext aus den Firmendaten: Schlüssel weglassen. Beim Bearbeiten heißt leer "kein Text".
    if (isEditing) return { ...input, closingText: toNullable(closingText) };
    const closing = toNullable(closingText);
    return closing === null ? input : { ...input, closingText: closing };
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = validate();
    setError(message);
    if (message !== null) return;

    const options = {
      onSuccess: (saved: Offer) => {
        toast.success(isEditing ? "Angebot gespeichert" : "Angebot angelegt");
        onSaved(saved);
      },
      onError: (mutationError: unknown) => setError(getApiErrorMessage(mutationError)),
    };
    if (offer === null) {
      createOffer.mutate(buildInput(), options);
      return;
    }
    updateOffer.mutate({ offerId: offer.offerId, data: buildInput() }, options);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <PageHeader
        title={isEditing ? "Angebot bearbeiten" : "Neues Angebot"}
        description="Der Entwurf kann beliebig geändert werden. Nummer und PDF entstehen erst beim Versenden."
        actions={
          <>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              Speichern
            </Button>
          </>
        }
      />

      {error !== null && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="offer-customer">Kunde</Label>
          <Select value={customerId} onValueChange={setCustomerId} disabled={isSaving}>
            <SelectTrigger id="offer-customer">
              <SelectValue placeholder={customers.isPending ? "Wird geladen" : "Kunde wählen"} />
            </SelectTrigger>
            <SelectContent>
              {customerOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="offer-date">Angebotsdatum</Label>
          <Input
            id="offer-date"
            type="date"
            value={offerDate}
            onChange={(event) => setOfferDate(event.target.value)}
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offer-valid-until">Gültig bis</Label>
          <Input
            id="offer-valid-until"
            type="date"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="offer-intro">
          Einleitung <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="offer-intro" value={introText} onChange={(event) => setIntroText(event.target.value)} rows={3} />
      </div>

      <section className="space-y-3" aria-labelledby="offer-items-heading">
        <h2 id="offer-items-heading" className="text-base font-semibold">
          Positionen
        </h2>
        <LineItemsEditor value={items} onChange={setItems} disabled={isSaving} onValidityChange={setAreItemsValid} />
      </section>

      <div className="space-y-2">
        <Label htmlFor="offer-closing">
          Schlusstext <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="offer-closing"
          value={closingText}
          onChange={(event) => setClosingText(event.target.value)}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {isEditing
            ? "Leer lassen = kein Schlusstext."
            : "Leer lassen = Standardtext aus den Einstellungen."}
        </p>
      </div>
    </form>
  );
}
