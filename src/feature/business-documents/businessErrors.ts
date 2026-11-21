import { isAxiosError } from "axios";
import { getApiErrorMessage } from "@/lib/apiError.ts";

/** Produktion ersetzt jeden 4xx-Text durch diesen Platzhalter (`ErrorResult`); nur der Statuscode ist verlässlich. */
const GENERIC_API_MESSAGE = "An error occurred";

const HTTP_BAD_REQUEST = 400;
const HTTP_CONFLICT = 409;

export type BusinessAction = "finalize" | "send" | "delete" | "unpay" | "cancel" | "import" | "other";

/** Fehlerstatus und, falls die API ihn nennt (Entwicklung), der konkrete Text. */
export function readApiError(error: unknown): { status: number | null; message: string | null } {
  if (!isAxiosError(error)) return { status: null, message: null };
  const data: unknown = error.response?.data;
  const text = typeof data === "object" && data !== null && "error" in data ? data.error : null;
  const isSpecific = typeof text === "string" && text !== "" && text !== GENERIC_API_MESSAGE;
  return { status: error.response?.status ?? null, message: isSpecific ? text : null };
}

const BAD_REQUEST_TEXTS: Record<BusinessAction, string> = {
  finalize: "Festschreiben nicht möglich: Datum (nicht in der Zukunft, nicht vor dem 1. Januar), Leistungsdatum "
    + "und Summe (größer 0) prüfen.",
  send: "Versenden nicht möglich: Das Angebotsdatum darf nicht in der Zukunft oder vor dem 1. Januar liegen.",
  delete: "Eingaben ungültig",
  unpay: "Eingaben ungültig",
  cancel: "Eingaben ungültig",
  import: "Eingaben ungültig",
  other: "Eingaben ungültig",
};

const CONFLICT_TEXTS: Record<BusinessAction, string> = {
  finalize: "Der Stand des Dokuments hat sich geändert. Seite neu laden.",
  send: "Der Stand des Dokuments hat sich geändert. Seite neu laden.",
  delete: "Löschen nicht möglich: Der Entwurf wird von einer Schlussrechnung referenziert.",
  unpay: "Zahlung kann nicht zurückgenommen werden: Eine festgeschriebene Schlussrechnung zieht diese Anzahlung ab.",
  cancel: "Stornieren nicht möglich: Eine festgeschriebene Schlussrechnung zieht diese Anzahlung ab.",
  import: "Die Rechnungsnummer ist bereits vergeben.",
  other: "Aktion im aktuellen Zustand nicht möglich. Seite neu laden.",
};

/**
 * Deutscher Fehlertext je Aktion. Nennt die API eine konkrete Meldung (Entwicklung), gilt diese; sonst wird
 * der Statuscode (400/409) auf einen aktionsspezifischen Text abgebildet.
 */
export function getBusinessErrorMessage(error: unknown, action: BusinessAction): string {
  const { status, message } = readApiError(error);
  if (message !== null) return message;
  if (status === HTTP_BAD_REQUEST) return BAD_REQUEST_TEXTS[action];
  if (status === HTTP_CONFLICT) return CONFLICT_TEXTS[action];
  return getApiErrorMessage(error);
}

export type ImportConflict = "duplicate" | "jump" | "unknown";

/** Unterscheidet beim Import-409 Doppelvergabe und Nummernsprung; ohne konkrete Meldung bleibt "unknown". */
export function classifyImportConflict(error: unknown): ImportConflict | null {
  const { status, message } = readApiError(error);
  if (status !== HTTP_CONFLICT) return null;
  if (message === null) return "unknown";
  if (message.includes("skips numbers")) return "jump";
  if (message.includes("already taken")) return "duplicate";
  return "unknown";
}
