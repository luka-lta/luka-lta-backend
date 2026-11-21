const CENTS_PER_EURO = 100;
const MONEY_FORMAT = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

/** Formatiert Cent als Euro-Betrag, auch negativ (z. B. "-300,00 €"). */
export function formatCents(cents: number): string {
  return MONEY_FORMAT.format(cents / CENTS_PER_EURO);
}

/** Höchstens 12 Stellen vor dem Komma, wie in der API. */
const MONEY_PATTERN = /^(-?)(\d{1,12})(?:,(\d{1,2}))?$/;

/**
 * Wandelt eine Euro-Eingabe ("90", "90,5", "1.234,50", "-12.5") in Cent um.
 * Mit Komma gilt der Punkt als Tausendertrenner, ohne Komma als Dezimaltrenner.
 * Rein ganzzahlig gerechnet. Ungültige Eingabe → null.
 */
export function parseEuroInput(value: string): number | null {
  const cleaned = value.replace(/[\s€]/g, "");
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "") : cleaned.replace(".", ",");
  const match = MONEY_PATTERN.exec(normalized);
  if (match === null) return null;
  const euros = Number(match[2]);
  const cents = Number((match[3] ?? "").padEnd(2, "0"));
  const total = euros * CENTS_PER_EURO + cents;
  if (!Number.isSafeInteger(total)) return null;
  return match[1] === "-" ? -total : total;
}

/** Cent als editierbarer Eingabetext ("90,00"), ohne Währungszeichen und Tausenderpunkte. */
export function centsToInputText(cents: number): string {
  const absolute = Math.abs(cents);
  const euros = Math.floor(absolute / CENTS_PER_EURO);
  const rest = String(absolute % CENTS_PER_EURO).padStart(2, "0");
  return `${cents < 0 ? "-" : ""}${euros},${rest}`;
}

const QUANTITY_PATTERN = /^(\d{1,7})(?:[.,](\d{1,2}))?$/;
const HUNDREDTHS_PER_UNIT = 100;

/** Menge ("1.5" oder "1,5") als Hundertstel; muss größer 0 sein, sonst null. */
export function parseQuantityHundredths(value: string): number | null {
  const match = QUANTITY_PATTERN.exec(value.trim());
  if (match === null) return null;
  const hundredths = Number(match[1]) * HUNDREDTHS_PER_UNIT + Number((match[2] ?? "").padEnd(2, "0"));
  return hundredths > 0 ? hundredths : null;
}

/**
 * Positionssumme wie in der API (kaufmännisch gerundet, half away from zero, Vorzeichen getrennt).
 * Nur Anzeige, maßgeblich ist die Antwort der API.
 */
export function calculateLineTotalCents(unitPriceCents: number, quantityHundredths: number): number {
  const rounded = Math.round((Math.abs(unitPriceCents) * quantityHundredths) / HUNDREDTHS_PER_UNIT);
  return unitPriceCents < 0 ? -rounded : rounded;
}
