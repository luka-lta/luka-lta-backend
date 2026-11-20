import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { ErrorState } from "@/components/feedback/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { loadPdfBlob } from "./pdfBlob";

/** Fragment für Chromium: Seite auf Breite einpassen (in anderen Browsern wirkungslos). */
const VIEWER_FRAGMENT = "#view=FitH";

interface PdfPreviewProps {
  path: string;
  queryKey: readonly unknown[];
  title: string;
  /** Finale Dokumente ändern sich nie: kein Neuladen. */
  isFinal: boolean;
  /** Blockiert den Request (z. B. fehlende Voraussetzungen) und zeigt stattdessen `blockedHint`. */
  isBlocked?: boolean;
  blockedHint?: ReactNode;
}

/** Eingebettete PDF-Vorschau; lädt per authentifiziertem Request und zeigt das PDF über eine Blob-URL. */
export function PdfPreview({ path, queryKey, title, isFinal, isBlocked = false, blockedHint }: PdfPreviewProps) {
  const query = useQuery({
    queryKey,
    queryFn: async () => (await loadPdfBlob(path)).blob,
    enabled: !isBlocked,
    staleTime: isFinal ? Infinity : 0,
  });
  const blob = query.data;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob === undefined) {
      setBlobUrl(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  if (isBlocked) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        {blockedHint}
      </div>
    );
  }
  if (query.isError) {
    return (
      <ErrorState
        title="Vorschau konnte nicht geladen werden"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (blobUrl === null) {
    return (
      <Skeleton className="aspect-[1/1.414] w-full rounded-xl" aria-busy="true" aria-label="Vorschau wird geladen" />
    );
  }
  return (
    <div className="space-y-2">
      <iframe
        src={`${blobUrl}${VIEWER_FRAGMENT}`}
        title={title}
        className="aspect-[1/1.414] w-full rounded-xl border bg-white"
      />
      <a
        href={blobUrl}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ExternalLink className="size-4" aria-hidden />
        In neuem Tab öffnen
      </a>
    </div>
  );
}
