import { isAxiosError } from "axios";
import api from "@/api/axios.ts";

const FILE_NAME_PATTERN = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;

function readFileName(contentDisposition: unknown, fallback: string): string {
  if (typeof contentDisposition !== "string") return fallback;
  const match = FILE_NAME_PATTERN.exec(contentDisposition);
  if (match === null) return fallback;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
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

/** Lädt ein PDF per authentifiziertem Request und startet den Browser-Download. */
export async function downloadPdf(path: string, fileName: string): Promise<void> {
  const response = await api.get(path, { responseType: "blob" }).catch(async (error: unknown) => {
    throw await toReadableError(error);
  });
  const url = URL.createObjectURL(response.data as Blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = readFileName(response.headers["content-disposition"], fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
