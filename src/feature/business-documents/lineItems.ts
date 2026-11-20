import { calculateLineTotalCents, parseQuantityHundredths } from "@/feature/business-documents/money.ts";

/** Eine Position wie im Request an die API (Menge als String, Preis in Cent). */
export interface LineItemInput {
  description: string;
  quantity: string;
  unit: string;
  unitPriceCents: number;
}

/** Längen laut API. */
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_UNIT_LENGTH = 30;

export const EMPTY_LINE_ITEM: LineItemInput = { description: "", quantity: "1", unit: "", unitPriceCents: 0 };

/** Fehlertext zu einer Position oder null; ungültige Preistexte sind nicht in `LineItemInput` abgebildet. */
export function validateLineItems(items: LineItemInput[]): string | null {
  if (items.length === 0) return "Mindestens eine Position ist erforderlich";
  for (const [index, item] of items.entries()) {
    const label = `Position ${index + 1}`;
    if (item.description.trim() === "") return `${label}: Beschreibung fehlt`;
    if (item.description.length > MAX_DESCRIPTION_LENGTH) return `${label}: Beschreibung ist zu lang`;
    if (item.unit.length > MAX_UNIT_LENGTH) return `${label}: Einheit ist zu lang`;
    if (parseQuantityHundredths(item.quantity) === null) {
      return `${label}: Menge muss größer 0 sein (höchstens 2 Nachkommastellen)`;
    }
  }
  return null;
}

/** Summe aller gültigen Positionen (nur Anzeige, die API rechnet maßgeblich). */
export function sumLineItems(items: LineItemInput[]): number {
  return items.reduce((sum, item) => {
    const hundredths = parseQuantityHundredths(item.quantity);
    return hundredths === null ? sum : sum + calculateLineTotalCents(item.unitPriceCents, hundredths);
  }, 0);
}

