import { loadPdfBlob } from "./pdfBlob";

/** Wartezeit, bis die Blob-URL nach dem Download-Klick freigegeben wird. */
const REVOKE_DELAY_MS = 10_000;
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

/** Lädt ein PDF per authentifiziertem Request und startet den Browser-Download. */
export async function downloadPdf(path: string, fileName: string): Promise<void> {
  const { blob, contentDisposition } = await loadPdfBlob(path);
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = readFileName(contentDisposition, fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Erst nach dem Klick freigeben: Der Browser startet den Download asynchron
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
  }
}
