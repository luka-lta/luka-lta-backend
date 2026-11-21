import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { MoneyText } from "@/feature/business-documents/MoneyText.tsx";
import {
  calculateLineTotalCents,
  centsToInputText,
  parseEuroInput,
  parseQuantityHundredths,
} from "@/feature/business-documents/money.ts";
import {
  EMPTY_LINE_ITEM,
  MAX_DESCRIPTION_LENGTH,
  MAX_UNIT_LENGTH,
  sumLineItems,
  type LineItemInput,
} from "@/feature/business-documents/lineItems.ts";

export type { LineItemInput };

interface Props {
  value: LineItemInput[];
  onChange: (next: LineItemInput[]) => void;
  disabled?: boolean;
  /**
   * Meldet, ob alle Preis- und Mengentexte gültig sind (auch beim ersten Rendern). Ungültige Preistexte
   * sind in `value` nicht sichtbar; Aufrufer MÜSSEN Speichern/Versenden sperren, solange `false` gemeldet wird.
   */
  onValidityChange?: (isValid: boolean) => void;
}

/**
 * Positionen bearbeiten. Der Preis wird als Text geführt (Zwischenzustände wie "1,"), nach oben geht nur der
 * geparste Cent-Wert; bei ungültigem Preistext bleibt der letzte gültige Wert stehen und das Feld wird markiert.
 */
export function LineItemsEditor({ value, onChange, disabled, onValidityChange }: Props) {
  const [priceTexts, setPriceTexts] = useState<string[]>(() =>
    value.map((item) => centsToInputText(item.unitPriceCents)),
  );

  const isValid =
    value.every((item) => parseQuantityHundredths(item.quantity) !== null) &&
    value.every((_, index) => parseEuroInput(priceTexts[index] ?? "") !== null);
  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  function updateItem(index: number, patch: Partial<LineItemInput>) {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function updatePrice(index: number, text: string) {
    setPriceTexts((texts) => texts.map((current, textIndex) => (textIndex === index ? text : current)));
    const cents = parseEuroInput(text);
    if (cents !== null) updateItem(index, { unitPriceCents: cents });
  }

  function addItem() {
    setPriceTexts((texts) => [...texts, centsToInputText(EMPTY_LINE_ITEM.unitPriceCents)]);
    onChange([...value, { ...EMPTY_LINE_ITEM }]);
  }

  function removeItem(index: number) {
    setPriceTexts((texts) => texts.filter((_, textIndex) => textIndex !== index));
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-3">
      {value.map((item, index) => {
        const priceText = priceTexts[index] ?? "";
        const isPriceInvalid = parseEuroInput(priceText) === null;
        const hundredths = parseQuantityHundredths(item.quantity);
        const isQuantityInvalid = hundredths === null;
        return (
          <div key={index} className="space-y-3 rounded-lg border bg-card p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_6rem_6rem_8rem_8rem_auto] sm:items-end">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor={`item-${index}-description`}>Position {index + 1}</Label>
                <Input
                  id={`item-${index}-description`}
                  value={item.description}
                  onChange={(event) => updateItem(index, { description: event.target.value })}
                  placeholder="Beschreibung"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`item-${index}-quantity`}>Menge</Label>
                <Input
                  id={`item-${index}-quantity`}
                  value={item.quantity}
                  onChange={(event) => updateItem(index, { quantity: event.target.value })}
                  inputMode="decimal"
                  aria-invalid={isQuantityInvalid ? true : undefined}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`item-${index}-unit`}>Einheit</Label>
                <Input
                  id={`item-${index}-unit`}
                  value={item.unit}
                  onChange={(event) => updateItem(index, { unit: event.target.value })}
                  placeholder="Std."
                  maxLength={MAX_UNIT_LENGTH}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`item-${index}-price`}>Einzelpreis (€)</Label>
                <Input
                  id={`item-${index}-price`}
                  value={priceText}
                  onChange={(event) => updatePrice(index, event.target.value)}
                  inputMode="decimal"
                  aria-invalid={isPriceInvalid ? true : undefined}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1.5 sm:text-right">
                <span className="block text-sm font-medium">Summe</span>
                <div className="flex h-9 items-center sm:justify-end">
                  <MoneyText
                    cents={hundredths === null ? 0 : calculateLineTotalCents(item.unitPriceCents, hundredths)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={disabled || value.length === 1}
                aria-label={`Position ${index + 1} entfernen`}
              >
                <Trash2 />
              </Button>
            </div>
            {isPriceInvalid && (
              <p className="text-xs font-medium text-destructive">Ungültiger Preis, z. B. 90,00 oder 1.234,50</p>
            )}
          </div>
        );
      })}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={disabled}>
          <Plus />
          Position hinzufügen
        </Button>
        <p className="text-sm">
          <span className="text-muted-foreground">Gesamt (ca.): </span>
          <MoneyText cents={sumLineItems(value)} className="font-semibold" />
        </p>
      </div>
    </div>
  );
}
