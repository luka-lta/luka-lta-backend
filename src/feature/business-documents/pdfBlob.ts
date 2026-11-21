import { isAxiosError } from "axios";
import api from "@/api/axios.ts";

export interface PdfBlobResult {
  blob: Blob;
  contentDisposition: unknown;
}

/** Bei responseType "blob" ist auch der Fehlerkörper ein Blob; die echte Meldung steckt darin als JSON. */
async function toReadableError(error: unknown): Promise<unknown> {
  if (!isAxiosError(error) || !(error.response?.data instanceof Blob)) return error;
  try {
    const parsed: unknown = JSON.parse(await error.response.data.text());
    if (typeof parsed === "object" && parsed !== null && "error" in parsed && typeof parsed.error === "string") {
      return new Error(parsed.error);
    }
  } catch {
    // kein JSON: ursprünglichen Fehler weiterreichen
  }
  return error;
}

/** Lädt ein PDF per authentifiziertem Request (kein Token in der URL) und liefert Blob samt Content-Disposition. */
export async function loadPdfBlob(path: string): Promise<PdfBlobResult> {
  const response = await api.get(path, { responseType: "blob" }).catch(async (error: unknown) => {
    throw await toReadableError(error);
  });
  return {
    blob: response.data as Blob,
    contentDisposition: response.headers["content-disposition"],
  };
}
