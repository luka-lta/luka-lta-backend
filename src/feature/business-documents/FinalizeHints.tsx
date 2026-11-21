import { Link } from "react-router-dom";

interface Props {
  /** Firmendaten fehlen (GET /business/settings lieferte null). */
  isSettingsMissing: boolean;
  /** Ergebnis von `getDocumentDateHint`. */
  dateHint: string | null;
}

const HINT_CLASS = "rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm";

/** Sichtbare Begründungen, warum Festschreiben/Versenden gesperrt ist (Produktion liefert nur generische Fehler). */
export function FinalizeHints({ isSettingsMissing, dateHint }: Props) {
  return (
    <>
      {isSettingsMissing && (
        <p role="status" className={HINT_CLASS}>
          Firmendaten fehlen: Ohne vollständige Firmendaten kann nichts festgeschrieben werden.{" "}
          <Link to="/dashboard/business/settings" className="font-medium underline underline-offset-4">
            Zu den Einstellungen
          </Link>
        </p>
      )}
      {dateHint !== null && (
        <p role="status" className={HINT_CLASS}>
          {dateHint}
        </p>
      )}
    </>
  );
}
