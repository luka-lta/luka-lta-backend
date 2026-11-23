import { StatusBadge, type StatusTone } from "@/components/feedback/status-badge.tsx";

/** Angebotsstatus laut API. */
export type OfferStatusValue = "draft" | "sent" | "accepted" | "rejected";
/** Rechnungsstatus laut API (`issued` = festgeschriebene Stornorechnung). */
export type InvoiceStatusValue = "draft" | "open" | "paid" | "cancelled" | "issued";

type Props =
  | { kind: "offer"; status: OfferStatusValue }
  | { kind: "invoice"; status: InvoiceStatusValue; isOverdue?: boolean };

interface Appearance {
  tone: StatusTone;
  label: string;
}

const OFFER_APPEARANCE: Record<OfferStatusValue, Appearance> = {
  draft: { tone: "neutral", label: "Entwurf" },
  sent: { tone: "info", label: "Versendet" },
  accepted: { tone: "success", label: "Angenommen" },
  rejected: { tone: "danger", label: "Abgelehnt" },
};

const INVOICE_APPEARANCE: Record<InvoiceStatusValue, Appearance> = {
  draft: { tone: "neutral", label: "Entwurf" },
  open: { tone: "info", label: "Offen" },
  paid: { tone: "success", label: "Bezahlt" },
  cancelled: { tone: "neutral", label: "Storniert" },
  issued: { tone: "neutral", label: "Gebucht" },
};

const OVERDUE_APPEARANCE: Appearance = { tone: "danger", label: "Überfällig" };

/** Statusanzeige für Angebote und Rechnungen. Eine offene, überfällige Rechnung erscheint als "Überfällig". */
export function DocumentStatusBadge(props: Props) {
  const appearance = resolveAppearance(props);
  return <StatusBadge tone={appearance.tone}>{appearance.label}</StatusBadge>;
}

function resolveAppearance(props: Props): Appearance {
  if (props.kind === "offer") return OFFER_APPEARANCE[props.status];
  if (props.status === "open" && props.isOverdue === true) return OVERDUE_APPEARANCE;
  return INVOICE_APPEARANCE[props.status];
}
